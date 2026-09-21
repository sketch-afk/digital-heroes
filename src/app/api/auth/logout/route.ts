import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    
    // Redirect to home page
    return NextResponse.redirect(new URL('/', req.url));
  } catch (err) {
    return NextResponse.redirect(new URL('/', req.url));
  }
}
