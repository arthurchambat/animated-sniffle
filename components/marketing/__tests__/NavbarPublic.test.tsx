import { render, screen } from "@testing-library/react";
import { act } from "react";
import { NavbarPublic, NAV_SECTIONS } from "@/components/marketing/NavbarPublic";

describe("NavbarPublic", () => {
  it("renders navigation sections and CTA", () => {
    render(<NavbarPublic sections={NAV_SECTIONS} />);

    expect(screen.getByText("Accueil")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toHaveAttribute("href", "#contact");
    expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute(
      "href",
      "/auth/sign-in"
    );
  });

  it("updates active section when chapter-change event is emitted", () => {
    render(<NavbarPublic sections={NAV_SECTIONS} />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent("chapter-change", { detail: { id: "pricing", theme: "dark" } })
      );
    });

    const pricingLink = screen.getByRole("link", { name: "Pricing" });
    expect(pricingLink).toHaveAttribute("aria-current", "page");
  });
});
