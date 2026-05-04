import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddCategoryForm } from "./AddCategoryForm";

describe("AddCategoryForm", () => {
  it("renders add button when not editing", () => {
    render(<AddCategoryForm onSubmit={async () => ({})} />);
    expect(screen.getByText("Añadir categoría")).toBeInTheDocument();
  });

  it("shows input and buttons when clicking add", async () => {
    render(<AddCategoryForm onSubmit={async () => ({})} />);
    await act(async () => {
      screen.getByText("Añadir categoría").click();
    });
    expect(screen.getByPlaceholderText("Ej. Platos principales")).toBeInTheDocument();
  });

  it("calls onSubmit with trimmed name when form is submitted", async () => {
    const onSubmit = vi.fn().mockResolvedValue({});
    render(<AddCategoryForm onSubmit={onSubmit} />);
    await act(async () => {
      screen.getByText("Añadir categoría").click();
    });

    const input = screen.getByPlaceholderText("Ej. Platos principales") as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, "Nueva Categoría");

    await act(async () => {
      input.closest("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(onSubmit).toHaveBeenCalledWith("Nueva Categoría");
  });

  it("does not call onSubmit when input is empty", async () => {
    const onSubmit = vi.fn().mockResolvedValue({});
    render(<AddCategoryForm onSubmit={onSubmit} />);
    await act(async () => {
      screen.getByText("Añadir categoría").click();
    });

    await act(async () => {
      screen.getByPlaceholderText("Ej. Platos principales").closest("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("returns to add button after successful submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue({});
    render(<AddCategoryForm onSubmit={onSubmit} />);
    await act(async () => {
      screen.getByText("Añadir categoría").click();
    });

    const input = screen.getByPlaceholderText("Ej. Platos principales") as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, "Postres");

    await act(async () => {
      input.closest("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(screen.getByText("Añadir categoría")).toBeInTheDocument();
  });

  it("stays in editing mode when submit returns error", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ error: "fail" });
    render(<AddCategoryForm onSubmit={onSubmit} />);
    await act(async () => {
      screen.getByText("Añadir categoría").click();
    });

    const input = screen.getByPlaceholderText("Ej. Platos principales") as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, "Postres");

    await act(async () => {
      input.closest("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(screen.getByPlaceholderText("Ej. Platos principales")).toBeInTheDocument();
  });

  it("cancels editing and returns to add button", async () => {
    render(<AddCategoryForm onSubmit={async () => ({})} />);
    await act(async () => {
      screen.getByText("Añadir categoría").click();
    });

    const buttons = screen.getAllByRole("button");
    const cancelButton = buttons.find((b) => b.getAttribute("type") === "button" && !b.textContent?.includes("Añadir"));
    await act(async () => {
      cancelButton?.click();
    });

    expect(screen.getByText("Añadir categoría")).toBeInTheDocument();
  });
});
