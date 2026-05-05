import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import IncompleteProfileBanner from "../IncompleteProfileBanner";

describe("IncompleteProfileBanner", () => {
  it("renders banner text when hasBusiness is false", () => {
    render(<IncompleteProfileBanner hasBusiness={false} />);
    expect(screen.getByText(/Completá los datos de tu negocio/)).toBeInTheDocument();
  });

  it("renders link to /settings/business when hasBusiness is false", () => {
    render(<IncompleteProfileBanner hasBusiness={false} />);
    const link = screen.getByRole("link", { name: /Ir a configuración/ });
    expect(link).toHaveAttribute("href", "/settings/business");
  });

  it("returns null when hasBusiness is true", () => {
    const { container } = render(<IncompleteProfileBanner hasBusiness={true} />);
    expect(container.firstChild).toBeNull();
  });
});
