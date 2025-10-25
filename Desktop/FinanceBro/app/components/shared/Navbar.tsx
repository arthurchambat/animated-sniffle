import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { NavbarClient } from "./Navbar.client";

interface NavbarProps {
  mode?: "public" | "app";
}

async function NavbarContent({ mode }: NavbarProps) {
  const user = await getCurrentUser();
  return <NavbarClient mode={mode ?? "public"} user={user} />;
}

export function Navbar(props: NavbarProps) {
  return (
    <Suspense fallback={null}>
      {/* Suspense avoids blocking the shell while fetching session */}
      <NavbarContent {...props} />
    </Suspense>
  );
}
