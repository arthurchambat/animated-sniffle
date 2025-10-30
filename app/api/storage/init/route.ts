import { NextResponse } from "next/server";
import { ensureCVSBucketExists } from "@/lib/supabase/ensure-bucket";

/**
 * API route to initialize the CVS storage bucket
 * Call this endpoint once to create the bucket automatically
 * GET /api/storage/init
 */
export async function GET() {
  try {
    const result = await ensureCVSBucketExists();

    if (!result.success) {
      return NextResponse.json(
        { 
          error: "Failed to initialize storage", 
          details: result.error,
          instructions: "Please create the bucket manually in Supabase Dashboard: Storage > Create bucket > Name: 'cvs'"
        },
        { status: 500 }
      );
    }

    if (result.created) {
      return NextResponse.json({
        success: true,
        message: "CVS bucket created successfully",
        nextSteps: [
          "Bucket 'cvs' has been created",
          "You need to configure RLS policies for security",
          "Run the SQL script in supabase/storage-setup.sql in your Supabase SQL Editor"
        ]
      });
    }

    return NextResponse.json({
      success: true,
      message: "CVS bucket already exists",
      status: "ready"
    });
  } catch (error: any) {
    console.error("[API] Storage init error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message,
        solution: "Check your SUPABASE_SERVICE_ROLE_KEY environment variable"
      },
      { status: 500 }
    );
  }
}
