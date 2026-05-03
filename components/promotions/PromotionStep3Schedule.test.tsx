import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PromotionStep3Schedule } from "./PromotionStep3Schedule";
import type { PromotionFormData } from "./types";

function makeFormData(overrides: Partial<PromotionFormData> = {}): PromotionFormData {
  return {
    title: "Promo Verano",
    description: "Desc",
    keyword: "verano",
    image_url: "",
    product_ids: [],
    start_date: "",
    end_date: "",
    days_of_week: [],
    is_active: true,
    has_date_range: false,
    has_day_filter: false,
    ...overrides,
  };
}

const DAYS_ES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

describe("PromotionStep3Schedule", () => {
  it("renders date range toggle off by default", () => {
    render(
      <PromotionStep3Schedule
        formData={makeFormData()}
        updateField={vi.fn()}
        toggleDay={vi.fn()}
        daysOfWeek={DAYS_ES}
        selectedProductCount={2}
      />,
    );

    expect(screen.getByText("Definir periodo de tiempo")).toBeInTheDocument();
    expect(screen.queryByLabelText("Fecha inicio")).not.toBeInTheDocument();
  });

  it("renders date inputs when has_date_range is true", () => {
    render(
      <PromotionStep3Schedule
        formData={makeFormData({ has_date_range: true, start_date: "2025-01-01", end_date: "2025-01-31" })}
        updateField={vi.fn()}
        toggleDay={vi.fn()}
        daysOfWeek={DAYS_ES}
        selectedProductCount={2}
      />,
    );

    expect(screen.getByDisplayValue("2025-01-01")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2025-01-31")).toBeInTheDocument();
  });

  it("renders day buttons when has_day_filter is true", () => {
    render(
      <PromotionStep3Schedule
        formData={makeFormData({ has_day_filter: true, days_of_week: [1, 3] })}
        updateField={vi.fn()}
        toggleDay={vi.fn()}
        daysOfWeek={DAYS_ES}
        selectedProductCount={2}
      />,
    );

    expect(screen.getByText("Lunes")).toBeInTheDocument();
    expect(screen.getByText("Miércoles")).toBeInTheDocument();
    expect(screen.getByText("Viernes")).toBeInTheDocument();
  });

  it("calls toggleDay when a day button is clicked", () => {
    const toggleDay = vi.fn();
    render(
      <PromotionStep3Schedule
        formData={makeFormData({ has_day_filter: true })}
        updateField={vi.fn()}
        toggleDay={toggleDay}
        daysOfWeek={DAYS_ES}
        selectedProductCount={2}
      />,
    );

    fireEvent.click(screen.getByText("Lunes"));
    expect(toggleDay).toHaveBeenCalledWith(1);
  });

  it("calls updateField when is_active switch is toggled", () => {
    const updateField = vi.fn();
    render(
      <PromotionStep3Schedule
        formData={makeFormData({ is_active: true })}
        updateField={updateField}
        toggleDay={vi.fn()}
        daysOfWeek={DAYS_ES}
        selectedProductCount={2}
      />,
    );

    const switches = screen.getAllByRole("switch");
    const isActiveSwitch = switches[switches.length - 1];
    fireEvent.click(isActiveSwitch);
    expect(updateField).toHaveBeenCalledWith("is_active", false);
  });

  it("renders summary with correct product count", () => {
    render(
      <PromotionStep3Schedule
        formData={makeFormData({ title: "Mi Promo", keyword: "verano" })}
        updateField={vi.fn()}
        toggleDay={vi.fn()}
        daysOfWeek={DAYS_ES}
        selectedProductCount={5}
      />,
    );

    expect(screen.getByText("Resumen")).toBeInTheDocument();
    expect(screen.getByText("Mi Promo")).toBeInTheDocument();
    expect(screen.getByText("5 producto(s)")).toBeInTheDocument();
  });

  it("renders date range summary when dates are set", () => {
    render(
      <PromotionStep3Schedule
        formData={makeFormData({
          has_date_range: true,
          start_date: "2025-06-01",
          end_date: "2025-06-30",
        })}
        updateField={vi.fn()}
        toggleDay={vi.fn()}
        daysOfWeek={DAYS_ES}
        selectedProductCount={1}
      />,
    );

    expect(screen.getByText(/Del 2025-06-01 al 2025-06-30/)).toBeInTheDocument();
  });

  it("renders 'Sin fecha de término' when no date range", () => {
    render(
      <PromotionStep3Schedule
        formData={makeFormData({ has_date_range: false })}
        updateField={vi.fn()}
        toggleDay={vi.fn()}
        daysOfWeek={DAYS_ES}
        selectedProductCount={1}
      />,
    );

    expect(screen.getByText("Sin fecha de término")).toBeInTheDocument();
  });
});
