import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IncompleteProfileBanner from "../IncompleteProfileBanner";

describe("IncompleteProfileBanner", () => {
  it("renders banner text when hasBusiness is false", () => {
    render(<IncompleteProfileBanner hasBusiness={false} />);
    expect(screen.getByText("Perfil Incompleto")).toBeInTheDocument();
    expect(
      screen.getByText(/Completá los datos de tu negocio/),
    ).toBeInTheDocument();
  });

  it("renders link to /settings/business when hasBusiness is false", () => {
    render(<IncompleteProfileBanner hasBusiness={false} />);
    const link = screen.getByRole("link", { name: /Ir a configuración/ });
    expect(link).toHaveAttribute("href", "/settings/business");
  });

  it("returns null when hasBusiness is true", () => {
    const { container } = render(
      <IncompleteProfileBanner hasBusiness={true} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("hides banner when close button is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <IncompleteProfileBanner hasBusiness={false} />,
    );

    expect(screen.getByText("Perfil Incompleto")).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: "Cerrar" });
    await user.click(closeButton);

    expect(container.firstChild).toBeNull();
  });

  it("renders close button with X icon when visible", () => {
    render(<IncompleteProfileBanner hasBusiness={false} />);

    const closeButton = screen.getByRole("button", { name: "Cerrar" });
    expect(closeButton).toBeInTheDocument();
  });
});
