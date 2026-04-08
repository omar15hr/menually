"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Input } from "../ui/input";
import { signIn } from "@/actions/auth.action";
import { SignInState } from "@/types/auth.types";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";

const initialState: SignInState = {
  status: "idle",
  error: null,
  data: null,
};

export default function SignInForm() {
  const [state, action, isPending] = useActionState(signIn, initialState);

  return (
    <div className="flex flex-col mt-30 mx-auto gap-6 animate-fade-in w-102.75">
      <h1 className="text-xl font-bold">¡Bienvenido nuevamente!</h1>

      <form className="flex flex-col gap-6" action={action}>
        <div className="flex flex-col gap-2">
          <Label>Correo electrónico</Label>
          <Input
            required
            type="email"
            name="email"
            autoComplete="email"
            placeholder="tucorreo@gmail.com"
            defaultValue={state.data?.email ?? ""}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Contraseña</Label>
          <Input
            required
            type="password"
            name="password"
            placeholder="Contraseña"
            autoComplete="current-password"
          />
        </div>

        <div className="flex justify-end">
          <Link
            href="/auth/reset-password"
            className="text-xs text-[#1C1C1C] font-semibold hover:text-foreground transition-colors underline"
          >
            Recuperar contraseña
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="text-base bg-[#CDF545] hover:bg-[#c0e740] text-[#114821] font-semibold py-2 px-4 rounded-lg h-10 cursor-pointer transition-colors"
        >
          {isPending ? <Spinner /> : "Iniciar sesión"}
        </button>
      </form>

      <hr className="text-[#E5E5E5]" />

      <p className="text-center text-sm text-[#585858]">
        ¿No tienes cuenta?{" "}
        <Link
          href="/auth/signup"
          className="text-[#1C1C1C] font-semibold underline text-sm"
        >
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
