export type SignInState =
  | { status: "idle"; error: null; data: null }
  | { status: "error"; error: string; data: { email: string } | null };

export type SignUpState =
  | {
      status: "idle";
      fieldErrors: Record<string, never>;
      error: null;
      data: null;
    }
  | {
      status: "error";
      fieldErrors: Partial<Record<SignUpField, string[]>>;
      error: string | null;
      data: { fullName: string; businessName: string; email: string } | null;
    };

type SignUpField =
  | "fullName"
  | "businessName"
  | "email"
  | "password"
  | "confirmPassword";

export type ResetPasswordState =
  | { status: "idle"; fieldErrors: Record<string, never>; data: null }
  | {
      status: "error";
      fieldErrors: { email?: string[] };
      data: { email: string } | null;
      formError?: string;
    }
  | { status: "success"; fieldErrors: Record<string, never>; data: null };

export type UpdatePasswordState =
  | { status: "idle"; fieldErrors: Record<string, never>; error: null }
  | {
      status: "error";
      fieldErrors: Partial<Record<"password" | "confirmPassword", string[]>>;
      error: string | null;
    };
