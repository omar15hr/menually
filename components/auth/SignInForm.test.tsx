import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SignInState } from "@/types/auth.types";

// ── Mock dependencies BEFORE imports ──────────────────────────────────

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

const mockSignIn = vi.fn();
vi.mock("@/actions/auth.action", () => ({
  signIn: mockSignIn,
}));

// ── Now import the component ──────────────────────────────────────────

import SignInForm from "./SignInForm";
import { toast } from "sonner";

const mockToastError = vi.mocked(toast.error);

// ── Helpers ───────────────────────────────────────────────────────────

function buildErrorState(overrides: Partial<SignInState> = {}): SignInState {
  return {
    status: "error",
    error: "Correo o contraseña incorrectos.",
    data: { email: "test@test.com" },
    ...overrides,
  } as SignInState;
}

// ── Tests ──────────────────────────────────────────────────────────────

describe("SignInForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockResolvedValue({
      status: "idle",
      error: null,
      data: null,
    } as SignInState);
  });

  // ── R3: Toast for signIn errors ───────────────────────────────────

  it("shows toast when signIn fails with wrong credentials", async () => {
    mockSignIn.mockResolvedValueOnce(
      buildErrorState({
        error: "Correo o contraseña incorrectos.",
        data: { email: "test@test.com" },
      }),
    );

    render(<SignInForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /iniciar sesión/i }),
      );
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Correo o contraseña incorrectos.",
      );
    });
  });

  it("does NOT show toast on initial render (idle status)", () => {
    render(<SignInForm />);

    expect(mockToastError).not.toHaveBeenCalled();
  });

  // ── R6: No regressions ───────────────────────────────────────────

  it("preserves email value on error via defaultValue", async () => {
    mockSignIn.mockResolvedValueOnce(
      buildErrorState({
        error: "Correo o contraseña incorrectos.",
        data: { email: "usuario@test.com" },
      }),
    );

    render(<SignInForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /iniciar sesión/i }),
      );
    });

    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText(
        "tucorreo@gmail.com",
      ) as HTMLInputElement;
      expect(emailInput.value).toBe("usuario@test.com");
    });
  });

  it("password field has no defaultValue (clear on error)", async () => {
    mockSignIn.mockResolvedValueOnce(
      buildErrorState({
        error: "Correo o contraseña incorrectos.",
        data: { email: "usuario@test.com" },
      }),
    );

    render(<SignInForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /iniciar sesión/i }),
      );
    });

    await waitFor(() => {
      const passwordInput = screen.getByPlaceholderText(
        "Contraseña",
      ) as HTMLInputElement;
      expect(passwordInput.value).toBe("");
    });
  });

  it("shows spinner and disables button while pending", async () => {
    mockSignIn.mockImplementationOnce(
      () =>
        new Promise<SignInState>((resolve) =>
          setTimeout(
            () =>
              resolve(
                buildErrorState({
                  error: "Correo o contraseña incorrectos.",
                }),
              ),
            100,
          ),
        ),
    );

    render(<SignInForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /iniciar sesión/i }),
      );
    });

    const button = screen.getByRole("button", { name: /iniciar sesión/i });
    expect(button).toBeDisabled();
  });

  // ── Smoke test ─────────────────────────────────────────────────────

  it("renders the form with all expected elements", () => {
    render(<SignInForm />);

    expect(
      screen.getByText("¡Bienvenido nuevamente!"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("tucorreo@gmail.com"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Recuperar contraseña")).toBeInTheDocument();
    expect(screen.getByText("Crear cuenta")).toBeInTheDocument();
  });
});