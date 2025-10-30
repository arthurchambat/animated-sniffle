import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-6 text-center">
      <span className="finance-gradient inline-flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-semibold text-white shadow-lg shadow-emerald-500/30">
        404
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-50">
          Cette page s&apos;est perdue dans le funnel.
        </h1>
        <p className="text-sm text-slate-300/80">
          Vérifiez le flux dans flow.excalidraw ou revenez à l&apos;accueil pour relancer la
          navigation.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
