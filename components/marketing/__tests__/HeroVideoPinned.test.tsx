import { render, screen } from "@testing-library/react";
import { HeroVideoPinned } from "@/components/marketing/HeroVideoPinned";

describe("HeroVideoPinned", () => {
  it("renders headline and CTA", () => {
    const { container } = render(<HeroVideoPinned ctaHref="/auth/sign-in" />);

    expect(
      screen.getByRole("heading", {
        name: /prépare tes entretiens finance avec un coach ia vidéo/i
      })
    ).toBeInTheDocument();

    const cta = screen.getByRole("link", { name: /commencer la session/i });
    expect(cta).toHaveAttribute("href", "/auth/sign-in");

    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("poster", "/images/hero-poster.svg");
    expect(video?.getAttribute("playsinline")).toBe("");
  });
});
