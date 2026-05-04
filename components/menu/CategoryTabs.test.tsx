import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryTabs } from "./CategoryTabs";

describe("CategoryTabs", () => {
  it("renders all tab labels", () => {
    render(
      <CategoryTabs
        tabs={["Entradas", "Platos", "Postres"]}
        activeTab={0}
        onTabChange={() => {}}
      />,
    );
    expect(screen.getByText("Entradas")).toBeInTheDocument();
    expect(screen.getByText("Platos")).toBeInTheDocument();
    expect(screen.getByText("Postres")).toBeInTheDocument();
  });

  it("calls onTabChange with index when a tab is clicked", () => {
    const onTabChange = vi.fn();
    render(
      <CategoryTabs
        tabs={["Entradas", "Platos"]}
        activeTab={0}
        onTabChange={onTabChange}
      />,
    );
    screen.getByText("Platos").click();
    expect(onTabChange).toHaveBeenCalledWith(1);
  });

  it("uses default primary color for active tab", () => {
    const { container } = render(
      <CategoryTabs tabs={["A"]} activeTab={0} onTabChange={() => {}} />,
    );
    const activeButton = container.querySelector("button");
    expect(activeButton?.style.color).toBe("rgb(37, 99, 235)");
  });

  it("uses custom primary color for active tab", () => {
    const { container } = render(
      <CategoryTabs
        tabs={["A"]}
        activeTab={0}
        primaryColor="#FF0000"
        onTabChange={() => {}}
      />,
    );
    const activeButton = container.querySelector("button");
    expect(activeButton?.style.color).toBe("rgb(255, 0, 0)");
  });

  it("renders nothing when tabs array is empty", () => {
    const { container } = render(
      <CategoryTabs tabs={[]} activeTab={0} onTabChange={() => {}} />,
    );
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });
});
