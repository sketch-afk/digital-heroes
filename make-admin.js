const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function makeAdmin() {
  const { data: profiles, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (fetchError) {
    console.error("Error fetching profile:", fetchError);
    return;
  }

  if (profiles.length > 0) {
    const profile = profiles[0];
    console.log(`Elevating ${profile.email} to admin...`);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', profile.id);
      
    if (updateError) {
       console.error("Failed to update role:", updateError);
    } else {
       console.log("Success! You are now an Admin.");
    }
  }
}

makeAdmin();
