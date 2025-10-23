import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <div className="bento-card mx-auto flex max-w-xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Créer un compte</h1>
        <p className="text-sm text-slate-300/80">
          Rejoignez les candidats qui utilisent FinanceBro pour leurs mock interviews.
        </p>
      </div>
      <AuthForm mode="register" />
      <p className="text-sm text-slate-300/80">
        Already have an account ?{" "}
        <Link href="/auth/(login)" className="font-semibold text-emerald-200">
          Sign in
        </Link>
      </p>
    </div>
  );
}
