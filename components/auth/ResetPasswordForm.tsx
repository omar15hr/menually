"use client";

import Link from "next/link";
import { useActionState } from "react";

import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { resetPassword } from "@/actions/auth.action";
import { ResetPasswordState } from "@/types/auth.types";

const initialState: ResetPasswordState = {
  status: "idle" as const,
  fieldErrors: {},
  data: null,
};

export default function ResetPasswordForm() {
  const [state, action, isPending] = useActionState(
    resetPassword,
    initialState,
  );

  return (
    <div className="flex flex-col mt-30 mx-auto gap-6 animate-fade-in w-102.75">
      <h1 className="text-xl font-bold">Recuperar contraseña</h1>
      <p className="text-sm text-[#585858]">
        Ingresa tu correo electrónico y te enviaremos un enlace para recuperar
        tu contraseña.
      </p>

      <form className="flex flex-col gap-6" action={action}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            required
            type="email"
            name="email"
            autoComplete="email"
            placeholder="tucorreo@gmail.com"
            defaultValue={state?.data?.email ?? ""}
            className={cn(state?.fieldErrors?.email && "ring-2 ring-red-500")}
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="text-base bg-[#CDF545] hover:bg-[#c0e740] text-[#114821] font-semibold py-2 px-4 rounded-lg h-10 cursor-pointer transition-colors"
        >
          {isPending ? <Spinner /> : "Enviar enlace de recuperación"}
        </Button>
      </form>

      <hr className="text-[#E5E5E5]" />

      <p className="text-center text-sm text-[#585858]">
        ¿Recordaste tu contraseña?{" "}
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
