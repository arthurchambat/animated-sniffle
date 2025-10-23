import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="bento-card mx-auto flex max-w-xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Connexion</h1>
        <p className="text-sm text-slate-300/80">
          Accédez à vos sessions, feedbacks et analytics.
        </p>
      </div>
      <AuthForm mode="login" />
      <p className="text-sm text-slate-300/80">
        No registered yet ?{" "}
        <Link href="/auth/register" className="font-semibold text-emerald-200">
          Create an account
        </Link>
      </p>
    </div>
  );
}
