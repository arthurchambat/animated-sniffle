import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface AuthRequest {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase admin non configuré. Impossible de créer un compte." },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as AuthRequest;
  if (!body.email) {
    return NextResponse.json({ error: "Email requis." }, { status: 400 });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: false,
    user_metadata: {
      firstName: body.firstName,
      lastName: body.lastName
    }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ user: data.user }, { status: 201 });
}
