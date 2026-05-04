import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MenuFieldInput } from "./MenuFieldInput";

describe("MenuFieldInput", () => {
  it("renders a Select for select type with options", () => {
    render(
      <MenuFieldInput
        field="typography"
        type="select"
        value="inter"
        options={[
          { value: "inter", label: "Inter" },
          { value: "roboto", label: "Roboto" },
        ]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders a toggle switch for toggle type", () => {
    render(
      <MenuFieldInput
        field="show_price"
        type="toggle"
        value={true}
        onChange={vi.fn()}
      />,
    );

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange when toggle is clicked", () => {
    const onChange = vi.fn();
    render(
      <MenuFieldInput
        field="show_price"
        type="toggle"
        value={false}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith("show_price", true);
  });

  it("toggle reflects false state correctly", () => {
    render(
      <MenuFieldInput
        field="show_price"
        type="toggle"
        value={false}
        onChange={vi.fn()}
      />,
    );

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });
});
