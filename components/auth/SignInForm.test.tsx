import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { SignInState } from "@/types/auth.types";

// ── Controlled state for useActionState mock ──────────────────────────

let mockState: SignInState = {
  status: "idle",
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
  signIn: vi.fn(),
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

function setState(state: SignInState, pending = false) {
  mockState = state;
  mockPending = pending;
}

function resetState() {
  mockState = {
    status: "idle",
    error: null,
    data: null,
  };
  mockPending = false;
}

// ── Tests ──────────────────────────────────────────────────────────────

describe("SignInForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetState();
  });

  // ── R3: Toast for signIn errors ───────────────────────────────────

  it("shows toast when signIn fails with wrong credentials", () => {
    setState(
      buildErrorState({
        error: "Correo o contraseña incorrectos.",
        data: { email: "test@test.com" },
      }),
    );

    render(<SignInForm />);

    expect(mockToastError).toHaveBeenCalledWith(
      "Correo o contraseña incorrectos.",
    );
  });

  it("does NOT show toast on initial render (idle status)", () => {
    setState({
      status: "idle",
      error: null,
      data: null,
    });

    render(<SignInForm />);

    expect(mockToastError).not.toHaveBeenCalled();
  });

  // ── R6: No regressions ───────────────────────────────────────────

  it("preserves email value on error via defaultValue", () => {
    setState(
      buildErrorState({
        error: "Correo o contraseña incorrectos.",
        data: { email: "usuario@test.com" },
      }),
    );

    render(<SignInForm />);

    const emailInput = screen.getByPlaceholderText(
      "tucorreo@gmail.com",
    ) as HTMLInputElement;
    expect(emailInput.value).toBe("usuario@test.com");
  });

  it("password field has no defaultValue (clear on error)", () => {
    setState(
      buildErrorState({
        error: "Correo o contraseña incorrectos.",
        data: { email: "usuario@test.com" },
      }),
    );

    render(<SignInForm />);

    const passwordInput = screen.getByPlaceholderText(
      "Contraseña",
    ) as HTMLInputElement;
    expect(passwordInput.value).toBe("");
  });

  it("shows spinner and disables button while pending", () => {
    setState(
      buildErrorState({
        error: "Correo o contraseña incorrectos.",
      }),
      true, // pending
    );

    render(<SignInForm />);

    // When pending, button shows Spinner (aria-label="Loading") instead of text
    const button = screen.getByRole("button", { name: /loading/i });
    expect(button).toBeDisabled();
  });

  // ── Smoke test ─────────────────────────────────────────────────────

  it("renders the form with all expected elements", () => {
    setState({
      status: "idle",
      error: null,
      data: null,
    });

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