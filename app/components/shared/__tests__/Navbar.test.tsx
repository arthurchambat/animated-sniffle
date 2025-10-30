import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { NavbarClient } from "@/app/components/shared/Navbar.client";

vi.mock("next/navigation", () => {
  return {
    usePathname: vi.fn(() => "/"),
    useRouter: () => ({
      push: vi.fn()
    })
  };
});

describe("NavbarClient", () => {
  it("renders public links and CTA for anonymous users", () => {
    render(<NavbarClient mode="public" user={null} />);

    expect(screen.getByText("Produit")).toBeInTheDocument();
    expect(screen.getByText("Équipe")).toHaveAttribute("href", "#equipe");

    const cta = screen.getByRole("link", { name: /get started/i });
    expect(cta).toHaveAttribute("href", "/auth/sign-in");
  });

  it("switches CTA when user is authenticated", () => {
    render(
      <NavbarClient
        mode="public"
        user={{ id: "1", email: "user@financebro.app", firstName: "Chris", plan: "medium" }}
      />
    );

    const cta = screen.getByRole("link", { name: /accéder à l'app/i });
    expect(cta).toHaveAttribute("href", "/home");
  });

  it("shows initials and dashboard links in app mode", () => {
    render(
      <NavbarClient
        mode="app"
        user={{ id: "2", email: "arthur@financebro.app", firstName: "Arthur", lastName: "P" }}
      />
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByLabelText("Accéder à l'accueil")).toBeInTheDocument();
  });
});
