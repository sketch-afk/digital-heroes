import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { plan } = await req.json(); // 'monthly' | 'yearly'
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Determine Stripe Price ID based on plan
    const priceId = plan === 'yearly' 
      ? process.env.STRIPE_PRICE_YEARLY 
      : process.env.STRIPE_PRICE_MONTHLY;

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 });
    }

    // Check if the user already has a Stripe customer ID stored in 'subscriptions' table
    let customerId: string | undefined;
    const { data: subscription } = await supabase.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).single();
    
    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
    } else {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name,
        metadata: {
          supabase_uuid: user.id
        }
      });
      customerId = customer.id;
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?canceled=true`,
      metadata: {
        supabase_uuid: user.id,
        plan: plan
      },
      subscription_data: {
        metadata: {
          supabase_uuid: user.id,
        }
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
