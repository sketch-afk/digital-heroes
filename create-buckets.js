const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupBuckets() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Error listing buckets:", listError);
    return;
  }
  
  const bucketNames = buckets.map(b => b.name);
  
  if (!bucketNames.includes('winner-proofs')) {
    console.log("Creating winner-proofs bucket...");
    const { error } = await supabase.storage.createBucket('winner-proofs', { public: false });
    if (error) console.error("Error creating winner-proofs:", error);
    else console.log("Created winner-proofs");
  }
  
  if (!bucketNames.includes('charity-media')) {
    console.log("Creating charity-media bucket...");
    const { error } = await supabase.storage.createBucket('charity-media', { public: true });
    if (error) console.error("Error creating charity-media:", error);
    else console.log("Created charity-media");
  }
}

setupBuckets();
