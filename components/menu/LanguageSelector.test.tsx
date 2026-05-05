import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSelector } from "./LanguageSelector";

const mockSetLanguage = vi.fn();

vi.mock("@/store/useLanguageStore", () => ({
  useLanguageStore: vi.fn((selector?: (state: { language: string; setLanguage: (lang: string) => void }) => unknown) => {
    const state = {
      language: "es",
      setLanguage: mockSetLanguage,
    };
    return selector ? selector(state) : state;
  }),
}));

describe("LanguageSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders current language label", () => {
    render(<LanguageSelector />);
    expect(screen.getByText("Español")).toBeInTheDocument();
  });

  it("opens dropdown on click", async () => {
    render(<LanguageSelector />);
    const button = screen.getByRole("button", { name: /Cambiar idioma/i });
    await userEvent.click(button);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("shows all language options in dropdown", async () => {
    render(<LanguageSelector />);
    const button = screen.getByRole("button", { name: /Cambiar idioma/i });
    await userEvent.click(button);
    expect(screen.getByRole("option", { name: "Español" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Português" })).toBeInTheDocument();
  });

  it("calls setLanguage when an option is selected", async () => {
    render(<LanguageSelector />);
    const button = screen.getByRole("button", { name: /Cambiar idioma/i });
    await userEvent.click(button);
    const englishOption = screen.getByRole("option", { name: "English" });
    await userEvent.click(englishOption);
    expect(mockSetLanguage).toHaveBeenCalledWith("en");
  });

  it("closes dropdown after selection", async () => {
    render(<LanguageSelector />);
    const button = screen.getByRole("button", { name: /Cambiar idioma/i });
    await userEvent.click(button);
    const englishOption = screen.getByRole("option", { name: "English" });
    await userEvent.click(englishOption);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("highlights the current language option", async () => {
    render(<LanguageSelector />);
    const button = screen.getByRole("button", { name: /Cambiar idioma/i });
    await userEvent.click(button);
    const esOption = screen.getByRole("option", { name: "Español" });
    expect(esOption).toHaveAttribute("aria-selected", "true");
    const enOption = screen.getByRole("option", { name: "English" });
    expect(enOption).toHaveAttribute("aria-selected", "false");
  });
});
