import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const supabase = await createClient();
  const { data: charities } = await supabase.from('charities').select('id, name').eq('is_active', true);

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <SignupForm charities={charities || []} />
    </div>
  );
}
