import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { SignUpState } from "@/types/auth.types";

// ── Controlled state for useActionState mock ──────────────────────────

let mockState: SignUpState = {
  status: "idle",
  fieldErrors: {},
  error: null,
  data: null,
};
let mockPending = false;

// ── Mocks (hoisted — no outer scope references in factories) ──────────

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

vi.mock("@/actions/auth.action", () => ({
  signUp: vi.fn(),
}));

// Mock useActionState to return our controlled state
vi.mock("react", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: vi.fn(() => [mockState, vi.fn(), mockPending]),
  };
});

// ── Import AFTER mocks ────────────────────────────────────────────────

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

function setState(state: SignUpState, pending = false) {
  mockState = state;
  mockPending = pending;
}

function resetState() {
  mockState = {
    status: "idle",
    fieldErrors: {},
    error: null,
    data: null,
  };
  mockPending = false;
}

// ── Tests ──────────────────────────────────────────────────────────────

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetState();
  });

  // ── R1: Field-level validation errors ──────────────────────────────

  it("shows field error text below password input when validation fails", () => {
    setState(
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

    expect(
      screen.getByText("La contraseña debe tener al menos 8 caracteres"),
    ).toBeInTheDocument();
  });

  it("shows field error for confirmPassword when passwords don't match", () => {
    setState(
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

    expect(
      screen.getByText("Las contraseñas no coinciden"),
    ).toBeInTheDocument();
  });

  it("shows field error for fullName when empty", () => {
    setState(
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

    expect(
      screen.getByText("Nombre completo es requerido"),
    ).toBeInTheDocument();
  });

  it("shows field error for businessName when empty", () => {
    setState(
      buildErrorState({
        fieldErrors: {
          businessName: ["Nombre del negocio es requerido"],
        },
        data: {
          fullName: "Juan",
          businessName: "",
          email: "test@test.com",
        },
      }),
    );

    render(<SignUpForm />);

    expect(
      screen.getByText("Nombre del negocio es requerido"),
    ).toBeInTheDocument();
  });

  it("shows field error for email when invalid", () => {
    setState(
      buildErrorState({
        fieldErrors: {
          email: ["Correo electrónico inválido"],
        },
        data: {
          fullName: "Juan",
          businessName: "Negocio",
          email: "",
        },
      }),
    );

    render(<SignUpForm />);

    expect(
      screen.getByText("Correo electrónico inválido"),
    ).toBeInTheDocument();
  });

  it("applies red ring class to errored password input", () => {
    setState(
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

    const passwordInput = screen.getByPlaceholderText("Mínimo 8 caracteres");
    expect(passwordInput.className).toContain("ring-red-500");
  });

  it("does NOT show error text on initial render (idle state)", () => {
    setState({
      status: "idle",
      fieldErrors: {},
      error: null,
      data: null,
    });

    render(<SignUpForm />);

    expect(
      screen.queryByText("La contraseña debe tener al menos 8 caracteres"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Nombre completo es requerido"),
    ).not.toBeInTheDocument();
  });

  it("shows multiple field errors simultaneously", () => {
    setState(
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

    expect(
      screen.getByText("La contraseña debe tener al menos 8 caracteres"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Las contraseñas no coinciden"),
    ).toBeInTheDocument();
  });

  // ── R2: Toast for Supabase errors ──────────────────────────────────

  it("shows toast when Supabase returns a general error", () => {
    setState(
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

    expect(mockToastError).toHaveBeenCalledWith(
      "Error al crear la cuenta. Intenta más tarde.",
    );
  });

  it("does NOT show toast on initial render (idle status)", () => {
    setState({
      status: "idle",
      fieldErrors: {},
      error: null,
      data: null,
    });

    render(<SignUpForm />);

    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("does NOT show toast when only fieldErrors exist (no general error)", () => {
    setState(
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

    expect(mockToastError).not.toHaveBeenCalled();
  });

  // ── R4: Password hints always visible ──────────────────────────────

  it("shows password requirement hints on initial render", () => {
    setState({
      status: "idle",
      fieldErrors: {},
      error: null,
      data: null,
    });

    render(<SignUpForm />);

    expect(
      screen.getByText("8+ caracteres, 1 mayúscula, 1 número"),
    ).toBeInTheDocument();
  });

  it("still shows password hints even when password has an error", () => {
    setState(
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

    expect(
      screen.getByText("8+ caracteres, 1 mayúscula, 1 número"),
    ).toBeInTheDocument();
  });

  // ── R5: Accessibility ──────────────────────────────────────────────

  it("error messages have role='alert' for screen readers", () => {
    setState(
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

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(
      "La contraseña debe tener al menos 8 caracteres",
    );
  });

  // ── R6: No regressions ────────────────────────────────────────────

  it("preserves non-password field values on error via defaultValue", () => {
    setState(
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

  it("password fields have no defaultValue (clear on error)", () => {
    setState(
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

    const passwordInput = screen.getByPlaceholderText(
      "Mínimo 8 caracteres",
    ) as HTMLInputElement;
    const confirmInput = screen.getByPlaceholderText(
      "Repite tu contraseña",
    ) as HTMLInputElement;

    expect(passwordInput.value).toBe("");
    expect(confirmInput.value).toBe("");
  });

  it("shows spinner and disables button while pending", () => {
    setState(
      buildErrorState({
        error: "Error al crear la cuenta. Intenta más tarde.",
        data: {
          fullName: "Juan",
          businessName: "Negocio",
          email: "test@test.com",
        },
      }),
      true, // pending
    );

    render(<SignUpForm />);

    // When pending, button shows Spinner (aria-label="Loading") instead of text
    const button = screen.getByRole("button", { name: /loading/i });
    expect(button).toBeDisabled();
  });

  // ── Edge case: fieldError returns first error only ─────────────────

  it("shows only the first error per field when multiple exist", () => {
    setState(
      buildErrorState({
        fieldErrors: {
          password: [
            "La contraseña debe tener al menos 8 caracteres",
            "Debe contener al menos una mayúscula",
          ],
        },
        data: {
          fullName: "Juan",
          businessName: "Negocio",
          email: "test@test.com",
        },
      }),
    );

    render(<SignUpForm />);

    // First error is shown
    expect(
      screen.getByText("La contraseña debe tener al menos 8 caracteres"),
    ).toBeInTheDocument();
    // Second error is NOT shown (fieldError only takes [0])
    expect(
      screen.queryByText("Debe contener al menos una mayúscula"),
    ).not.toBeInTheDocument();
  });
});