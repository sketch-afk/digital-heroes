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
  const { data, error } = await adminClient.from('charities').select('*').order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const is_featured = formData.get('is_featured') === 'true';
    const logoFile = formData.get('logo') as File | null;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const adminClient = createAdminClient();
    let logo_url = null;

    if (logoFile) {
      const ext = logoFile.name.split('.').pop();
      const filePath = `logos/${Date.now()}.${ext}`;
      const fileBuffer = await logoFile.arrayBuffer();

      const { data: uploadData, error: uploadError } = await adminClient
        .storage
        .from('charity-media')
        .upload(filePath, fileBuffer, {
          contentType: logoFile.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = adminClient
        .storage
        .from('charity-media')
        .getPublicUrl(uploadData.path);
      
      logo_url = publicUrlData.publicUrl;
    }

    const { data, error } = await adminClient
      .from('charities')
      .insert({
        name,
        description: description || null,
        logo_url,
        is_featured
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
