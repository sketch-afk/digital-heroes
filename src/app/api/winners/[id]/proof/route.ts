import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be smaller than 5MB" }, { status: 400 });
    }

    // Validate type (images only)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Verify user owns the winner record
    const adminClient = createAdminClient();
    const { data: winner, error: winnerError } = await adminClient
      .from('winners')
      .select('user_id, verification_status')
      .eq('id', id)
      .single();

    if (winnerError || !winner) return NextResponse.json({ error: "Winner record not found" }, { status: 404 });
    if (winner.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (winner.verification_status !== 'pending_proof' && winner.verification_status !== 'rejected') {
      return NextResponse.json({ error: "Proof already submitted or approved" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/${id}-${Date.now()}.${ext}`;
    
    // We must pass arrayBuffer or Blob to Supabase
    const fileBuffer = await file.arrayBuffer();

    const { data: uploadData, error: uploadError } = await adminClient
      .storage
      .from('winner-proofs')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Update winner record
    const { error: updateError } = await adminClient
      .from('winners')
      .update({
        proof_path: uploadData.path,
        verification_status: 'submitted'
      })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, path: uploadData.path });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
