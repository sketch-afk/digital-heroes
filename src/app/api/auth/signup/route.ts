import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, charityId, charityPercent } = await request.json();

    if (!email || !password || !fullName || !charityId) {
      return NextResponse.json({ error: { message: 'Missing required fields' } }, { status: 400 });
    }

    if (charityPercent < 10) {
      return NextResponse.json({ error: { message: 'Charity percent must be at least 10%' } }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // 1. Create the user in auth.users
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm for this prototype
    });

    if (signUpError) {
      return NextResponse.json({ error: { message: signUpError.message } }, { status: 400 });
    }

    // 2. Insert into profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      charity_id: charityId,
      charity_percent: charityPercent,
      role: 'subscriber'
    });

    if (profileError) {
      // Rollback user creation if profile fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: { message: profileError.message } }, { status: 400 });
    }

    return NextResponse.json({ data: { user: authData.user } });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message || 'Internal Server Error' } }, { status: 500 });
  }
}
