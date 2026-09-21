import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.from('draws').select('*').order('draw_month', { ascending: false });
  if (error) return NextResponse.json({ error }, { status: 500 });
  
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { draw_month, mode } = body; 

    if (!draw_month || !mode) {
      return NextResponse.json({ error: { message: "draw_month and mode are required" } }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient.from('draws').insert({
      draw_month,
      mode,
      status: 'draft',
      config: { min: 1, max: 45, count: 5 }
    }).select().single();

    if (error) {
      if (error.code === '23505') { 
        return NextResponse.json({ error: { message: "A draw for this month already exists." } }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
