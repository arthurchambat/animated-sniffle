/**
 * Utility to ensure the CVs bucket exists in Supabase Storage
 * This can be called from the server-side to auto-create the bucket if missing
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function ensureCVSBucketExists() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[Storage] Missing Supabase credentials");
    return { success: false, error: "Missing credentials" };
  }

  // Create admin client with service role key
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

    if (listError) {
      console.error("[Storage] Error listing buckets:", listError);
      return { success: false, error: listError.message };
    }

    const bucketExists = buckets?.some((bucket) => bucket.id === "cvs");

    if (bucketExists) {
      console.log("[Storage] CVS bucket already exists");
      return { success: true, created: false };
    }

    // Create the bucket
    const { data, error: createError } = await supabaseAdmin.storage.createBucket("cvs", {
      public: false,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ["application/pdf"],
    });

    if (createError) {
      console.error("[Storage] Error creating bucket:", createError);
      return { success: false, error: createError.message };
    }

    console.log("[Storage] CVS bucket created successfully");

    // Create RLS policies (this needs to be done via SQL)
    console.log("[Storage] ⚠️  Don't forget to run the SQL script to create RLS policies!");

    return { success: true, created: true };
  } catch (error: any) {
    console.error("[Storage] Unexpected error:", error);
    return { success: false, error: error.message };
  }
}
