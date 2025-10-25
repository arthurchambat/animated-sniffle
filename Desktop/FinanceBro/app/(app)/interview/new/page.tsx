import { redirect } from "next/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { PreInterviewForm } from "@/components/interview/PreInterviewForm";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function NewInterviewPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/sign-in");
  }

  // Récupérer le CV existant si disponible
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("cv_path")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvelle interview"
        subtitle="Configurez votre session d'entraînement personnalisée."
      />

      <PreInterviewForm existingCvPath={profile?.cv_path} userId={user.id} />
    </div>
  );
}
