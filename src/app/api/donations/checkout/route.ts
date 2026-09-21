import { stripe } from '@/lib/stripe/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { charityId, amount } = await req.json();

    if (!charityId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid donation details' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Verify charity exists
    const { data: charity } = await supabase.from('charities').select('name').eq('id', charityId).single();
    if (!charity) {
      return NextResponse.json({ error: 'Charity not found' }, { status: 404 });
    }

    // Create a Checkout Session for a one-time donation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Donation to ${charity.name}`,
            },
            unit_amount: amount, // amount in smallest currency unit (e.g. paise)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/charities/${charityId}?donation_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/charities/${charityId}?donation_canceled=true`,
      metadata: {
        type: 'donation',
        charity_id: charityId,
        supabase_uuid: user?.id || 'anonymous'
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
