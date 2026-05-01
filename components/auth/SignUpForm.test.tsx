import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SignUpState } from "@/types/auth.types";

// ── Mock dependencies BEFORE imports ──────────────────────────────────

// Mock next/link before any component imports it
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

// Mock sonner before any component imports it
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock the entire auth.action module
const mockSignUp = vi.fn();
vi.mock("@/actions/auth.action", () => ({
  signUp: mockSignUp,
}));

// ── Now import the component ──────────────────────────────────────────

import SignUpForm from "./SignUpForm";
import { toast } from "sonner";

const mockToastError = vi.mocked(toast.error);

// ── Helpers ───────────────────────────────────────────────────────────

function buildErrorState(overrides: Partial<SignUpState> = {}): SignUpState {
  return {
    status: "error",
    fieldErrors: {},
    error: null,
    data: null,
    ...overrides,
  } as SignUpState;
}

// ── Tests ──────────────────────────────────────────────────────────────

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: return idle state (simulates initial render call)
    mockSignUp.mockResolvedValue({
      status: "idle",
      fieldErrors: {},
      error: null,
      data: null,
    } as SignUpState);
  });

  // ── R1: Field-level validation errors ──────────────────────────────

  it("shows field error text below password input when validation fails", async () => {
    mockSignUp.mockResolvedValueOnce(
      buildErrorState({
        fieldErrors: {
          password: ["La contraseña debe tener al menos 8 caracteres"],
        },
        data: {
          fullName: "Juan",
          businessName: "Negocio",
          email: "test@test.com",
        },
      }),
    );

    render(<SignUpForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /crear cuenta/i }),
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("La contraseña debe tener al menos 8 caracteres"),
      ).toBeInTheDocument();
    });
  });

  it("shows field error for confirmPassword when passwords don't match", async () => {
    mockSignUp.mockResolvedValueOnce(
      buildErrorState({
        fieldErrors: {
          confirmPassword: ["Las contraseñas no coinciden"],
        },
        data: {
          fullName: "Juan",
          businessName: "Negocio",
          email: "test@test.com",
        },
      }),
    );

    render(<SignUpForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /crear cuenta/i }),
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("Las contraseñas no coinciden"),
      ).toBeInTheDocument();
    });
  });

  it("shows field error for fullName when empty", async () => {
    mockSignUp.mockResolvedValueOnce(
      buildErrorState({
        fieldErrors: {
          fullName: ["Nombre completo es requerido"],
        },
        data: {
          fullName: "",
          businessName: "Negocio",
          email: "test@test.com",
        },
      }),
    );

    render(<SignUpForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /crear cuenta/i }),
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("Nombre completo es requerido"),
      ).toBeInTheDocument();
    });
  });

  it("applies red ring class to errored password input", async () => {
    mockSignUp.mockResolvedValueOnce(
      buildErrorState({
        fieldErrors: {
          password: ["La contraseña debe tener al menos 8 caracteres"],
        },
        data: {
          fullName: "Juan",
          businessName: "Negocio",
          email: "test@test.com",
        },
      }),
    );

    render(<SignUpForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /crear cuenta/i }),
      );
    });

    await waitFor(() => {
      const passwordInput = screen.getByPlaceholderText(
        "Mínimo 8 caracteres",
      );
      expect(passwordInput.className).toContain("ring-red-500");
    });
  });

  it("does NOT show error text on initial render", () => {
    render(<SignUpForm />);

    expect(
      screen.queryByText("La contraseña debe tener al menos 8 caracteres"),
    ).not.toBeInTheDocument();
  });

  it("shows multiple field errors simultaneously", async () => {
    mockSignUp.mockResolvedValueOnce(
      buildErrorState({
        fieldErrors: {
          password: ["La contraseña debe tener al menos 8 caracteres"],
          confirmPassword: ["Las contraseñas no coinciden"],
        },
        data: {
          fullName: "Juan",
          businessName: "Negocio",
          email: "test@test.com",
        },
      }),
    );

    render(<SignUpForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /crear cuenta/i }),
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("La contraseña debe tener al menos 8 caracteres"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Las contraseñas no coinciden"),
      ).toBeInTheDocument();
    });
  });

  // ── R2: Toast for Supabase errors ──────────────────────────────────

  it("shows toast when Supabase returns a general error", async () => {
    mockSignUp.mockResolvedValueOnce(
      buildErrorState({
        error: "Error al crear la cuenta. Intenta más tarde.",
        data: {
          fullName: "Juan",
          businessName: "Negocio",
          email: "test@test.com",
        },
      }),
    );

    render(<SignUpForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /crear cuenta/i }),
      );
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Error al crear la cuenta. Intenta más tarde.",
      );
    });
  });

  it("does NOT show toast on initial render", () => {
    render(<SignUpForm />);

    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("does NOT show toast when only fieldErrors exist (no general error)", async () => {
    mockSignUp.mockResolvedValueOnce(
      buildErrorState({
        fieldErrors: {
          password: ["La contraseña debe tener al menos 8 caracteres"],
        },
        error: null,
        data: {
          fullName: "Juan",
          businessName: "Negocio",
          email: "test@test.com",
        },
      }),
    );

    render(<SignUpForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /crear cuenta/i }),
      );
    });

    await waitFor(() => {
      expect(mockToastError).not.toHaveBeenCalled();
    });
  });

  // ── R4: Password hints always visible ──────────────────────────────

  it("shows password requirement hints on initial render", () => {
    render(<SignUpForm />);

    expect(
      screen.getByText("8+ caracteres, 1 mayúscula, 1 número"),
    ).toBeInTheDocument();
  });

  // ── R5: Accessibility ──────────────────────────────────────────────

  it("error messages have role='alert' for screen readers", async () => {
    mockSignUp.mockResolvedValueOnce(
      buildErrorState({
        fieldErrors: {
          password: ["La contraseña debe tener al menos 8 caracteres"],
        },
        data: {
          fullName: "Juan",
          businessName: "Negocio",
          email: "test@test.com",
        },
      }),
    );

    render(<SignUpForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /crear cuenta/i }),
      );
    });

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(
        "La contraseña debe tener al menos 8 caracteres",
      );
    });
  });

  // ── R6: No regressions ────────────────────────────────────────────

  it("preserves non-password field values on error via defaultValue", async () => {
    mockSignUp.mockResolvedValueOnce(
      buildErrorState({
        fieldErrors: {
          password: ["La contraseña debe tener al menos 8 caracteres"],
        },
        data: {
          fullName: "Juan Pérez",
          businessName: "Mi Negocio",
          email: "juan@test.com",
        },
      }),
    );

    render(<SignUpForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /crear cuenta/i }),
      );
    });

    await waitFor(() => {
      const fullNameInput = screen.getByPlaceholderText(
        "Juan Pérez",
      ) as HTMLInputElement;
      const bizInput = screen.getByPlaceholderText(
        "Ej: La casa del chef",
      ) as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText(
        "tucorreo@gmail.com",
      ) as HTMLInputElement;

      expect(fullNameInput.value).toBe("Juan Pérez");
      expect(bizInput.value).toBe("Mi Negocio");
      expect(emailInput.value).toBe("juan@test.com");
    });
  });

  it("password fields have no defaultValue (clear on error)", async () => {
    mockSignUp.mockResolvedValueOnce(
      buildErrorState({
        fieldErrors: {
          confirmPassword: ["Las contraseñas no coinciden"],
        },
        data: {
          fullName: "Juan",
          businessName: "Negocio",
          email: "test@test.com",
        },
      }),
    );

    render(<SignUpForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /crear cuenta/i }),
      );
    });

    await waitFor(() => {
      const passwordInput = screen.getByPlaceholderText(
        "Mínimo 8 caracteres",
      ) as HTMLInputElement;
      const confirmInput = screen.getByPlaceholderText(
        "Repite tu contraseña",
      ) as HTMLInputElement;

      expect(passwordInput.value).toBe("");
      expect(confirmInput.value).toBe("");
    });
  });

  it("shows spinner and disables button while pending", async () => {
    mockSignUp.mockImplementationOnce(
      () =>
        new Promise<SignUpState>((resolve) =>
          setTimeout(
            () =>
              resolve(
                buildErrorState({
                  error: "Error al crear la cuenta. Intenta más tarde.",
                  data: {
                    fullName: "Juan",
                    businessName: "Negocio",
                    email: "test@test.com",
                  },
                }),
              ),
            100,
          ),
        ),
    );

    render(<SignUpForm />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /crear cuenta/i }),
      );
    });

    // Immediately check (before promise resolves)
    const button = screen.getByRole("button", { name: /crear cuenta/i });
    expect(button).toBeDisabled();
  });
});