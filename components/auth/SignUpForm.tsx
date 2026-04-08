"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { signUp } from "@/actions/auth.action";
import { SignUpState } from "@/types/auth.types";
import { Spinner } from "../ui/spinner";

const initialState: SignUpState = {
  status: "idle",
  fieldErrors: {},
  error: null,
  data: null,
};

export default function SignUpForm() {
  const [state, action, isPending] = useActionState(signUp, initialState);

  return (
    <div className="flex flex-col mt-10 mx-auto gap-6 animate-fade-in w-102.75">
      <h1 className="text-xl font-bold">¡Crea tu cuenta!</h1>

      <form className="flex flex-col gap-6" action={action}>
        <div className="flex flex-col gap-2">
          <Label>Nombre completo</Label>
          <Input
            required
            type="text"
            name="fullName"
            autoComplete="name"
            placeholder="Juan Pérez"
            defaultValue={state.data?.email ?? ""}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Nombre negocio</Label>
          <Input
            required
            type="text"
            name="businessName"
            autoComplete="businessName"
            placeholder="Ej: La casa del chef"
            defaultValue={state.data?.fullName ?? ""}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Correo electrónico</Label>
          <Input
            required
            type="email"
            name="email"
            autoComplete="email"
            placeholder="tucorreo@gmail.com"
            defaultValue={state.data?.businessName ?? ""}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Contraseña</Label>
          <Input
            required
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Confirmar contraseña</Label>
          <Input
            required
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="text-base bg-[#CDF545] hover:bg-[#c0e740] text-[#114821] font-semibold py-2 px-4 rounded-lg h-10 cursor-pointer transition-colors"
        >
          {isPending ? <Spinner /> : "Crear cuenta"}
        </button>
      </form>

      <hr className="text-[#E5E5E5]" />

      <p className="text-center text-sm text-[#585858]">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/auth/signin"
          className="text-[#1C1C1C] font-semibold underline text-sm"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
