import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PromotionStats } from "./PromotionStats";

function makeStats() {
  return [
    { id: 1, title: "Activas", desc: "Mostrándose actualmente", value: 3 },
    { id: 2, title: "Programadas", desc: "Inicia pronto", value: 1 },
    { id: 3, title: "Este mes", desc: "Promociones publicadas", value: 5 },
  ];
}

describe("PromotionStats", () => {
  it("renders 3 stat cards with titles and values", () => {
    const stats = makeStats();
    render(<PromotionStats stats={stats} />);

    expect(screen.getByText("Activas")).toBeInTheDocument();
    expect(screen.getByText("Programadas")).toBeInTheDocument();
    expect(screen.getByText("Este mes")).toBeInTheDocument();

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders descriptions", () => {
    const stats = makeStats();
    render(<PromotionStats stats={stats} />);

    expect(screen.getByText("Mostrándose actualmente")).toBeInTheDocument();
    expect(screen.getByText("Inicia pronto")).toBeInTheDocument();
    expect(screen.getByText("Promociones publicadas")).toBeInTheDocument();
  });

  it("renders empty when stats is empty", () => {
    render(<PromotionStats stats={[]} />);
    expect(screen.queryByText("Activas")).not.toBeInTheDocument();
  });
});
