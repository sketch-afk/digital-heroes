import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { calculatePaymentSplit } from '@/lib/domain/charity-split';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = await createAdminClient();

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find user by customer ID or metadata
        const customerId = subscription.customer as string;
        let userId = subscription.metadata?.supabase_uuid;

        if (!userId) {
          const customer = await stripe.customers.retrieve(customerId);
          if (!customer.deleted) {
             userId = customer.metadata?.supabase_uuid;
          }
        }

        if (!userId) break;

        // Upsert the subscription row
        const statusMap: Record<string, string> = {
          'active': 'active',
          'past_due': 'past_due',
          'canceled': 'cancelled',
          'unpaid': 'lapsed',
          'incomplete': 'inactive',
          'incomplete_expired': 'inactive',
          'trialing': 'active'
        };

        const planId = subscription.items.data[0].price.id;
        const plan = planId === process.env.STRIPE_PRICE_YEARLY ? 'yearly' : 'monthly';

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status: statusMap[subscription.status] || 'inactive',
          plan: plan,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' }); // Ensure unique constraint on user_id if setup that way
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.billing_reason !== 'subscription_create' && invoice.billing_reason !== 'subscription_cycle') break;
        if (invoice.amount_paid <= 0) break; // Free trial or 0 amount

        const customerId = invoice.customer as string;
        const subId = invoice.subscription as string;

        // Get local subscription to find user_id
        const { data: localSub } = await supabase.from('subscriptions').select('id, user_id, plan').eq('stripe_subscription_id', subId).single();
        if (!localSub) break;

        // Get user profile for charity percent and charity id
        const { data: profile } = await supabase.from('profiles').select('charity_id, charity_percent').eq('id', localSub.user_id).single();
        if (!profile) break;

        // Get platform config
        const { data: configRow } = await supabase.from('platform_settings').select('value').eq('key', 'prize_pool_pct').single();
        const prizePoolPct = configRow ? Number(configRow.value) : 50;

        // Calculate split
        const split = calculatePaymentSplit({
          grossAmount: invoice.amount_paid,
          charityPercent: profile.charity_percent,
          prizePoolPercent: prizePoolPct
        });

        // Insert payment
        const { data: payment, error: paymentError } = await supabase.from('payments').insert({
          subscription_id: localSub.id,
          user_id: localSub.user_id,
          stripe_invoice_id: invoice.id,
          gross_amount: invoice.amount_paid,
          currency: invoice.currency.toUpperCase(),
          prize_pool_amount: split.prizePoolAmount,
          charity_amount: split.charityAmount,
          charity_percent_applied: profile.charity_percent,
          platform_amount: split.platformAmount
        }).select().single();

        if (paymentError || !payment) {
          console.error('Failed to insert payment:', paymentError);
          break;
        }

        // Insert charity contribution
        if (profile.charity_id) {
          await supabase.from('charity_contributions').insert({
            user_id: localSub.user_id,
            charity_id: profile.charity_id,
            payment_id: payment.id,
            amount: split.charityAmount,
            percent: profile.charity_percent
          });
        }

        // Amortize prize pool for yearly
        const now = new Date();
        const numMonths = localSub.plan === 'yearly' ? 12 : 1;
        const monthlyPoolAmount = Math.floor(split.prizePoolAmount / numMonths);

        for (let i = 0; i < numMonths; i++) {
          const targetMonth = new Date(now.getFullYear(), now.getMonth() + i, 1);
          await supabase.from('prize_pool_ledger').insert({
            payment_id: payment.id,
            draw_month: targetMonth.toISOString().split('T')[0],
            amount: monthlyPoolAmount
          });
        }

        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.type === 'donation' && session.payment_status === 'paid') {
          const charityId = session.metadata.charity_id;
          const userId = session.metadata.supabase_uuid !== 'anonymous' ? session.metadata.supabase_uuid : null;
          
          await supabase.from('donations').insert({
            user_id: userId,
            charity_id: charityId,
            amount: session.amount_total || 0,
            stripe_payment_intent_id: session.payment_intent as string,
            status: 'succeeded'
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
