import { render, screen } from "@testing-library/react";
import { act } from "react";
import { useSectionObserver } from "@/lib/scroll/useSectionObserver";

function TestComponent({ ids }: { ids: string[] }) {
  const { activeId, activeIndex } = useSectionObserver(ids);
  return (
    <div>
      <span data-testid="active-id">{activeId}</span>
      <span data-testid="active-index">{activeIndex}</span>
    </div>
  );
}

describe("useSectionObserver", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    const mockClass = (globalThis as any).IntersectionObserverMock;
    if (mockClass?.instances) {
      mockClass.instances.length = 0;
    }
  });

  it("defaults to the first section and updates when intersection changes", () => {
    const ids = ["hero", "story", "value"];

    ids.forEach((id) => {
      const element = document.createElement("section");
      element.id = id;
      document.body.appendChild(element);
    });

    render(<TestComponent ids={ids} />);

    expect(screen.getByTestId("active-id")).toHaveTextContent("hero");
    expect(screen.getByTestId("active-index")).toHaveTextContent("0");

    const mockClass = (globalThis as any).IntersectionObserverMock;
    const instance = mockClass.instances[0];
    const storyElement = document.getElementById("story")!;
    const valueElement = document.getElementById("value")!;

    act(() => {
      instance.trigger([
        {
          target: storyElement,
          isIntersecting: true,
          intersectionRatio: 0.6,
          boundingClientRect: storyElement.getBoundingClientRect(),
          intersectionRect: storyElement.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now()
        } as IntersectionObserverEntry,
        {
          target: valueElement,
          isIntersecting: true,
          intersectionRatio: 0.4,
          boundingClientRect: valueElement.getBoundingClientRect(),
          intersectionRect: valueElement.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now()
        } as IntersectionObserverEntry
      ]);
    });

    expect(screen.getByTestId("active-id")).toHaveTextContent("story");
    expect(screen.getByTestId("active-index")).toHaveTextContent("1");
  });
});
