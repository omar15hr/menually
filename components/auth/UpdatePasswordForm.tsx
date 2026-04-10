"use client";

import Link from "next/link";
import { useActionState } from "react";

import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { updatePassword } from "@/actions/auth.action";
import { UpdatePasswordState } from "@/types/auth.types";

const initialState: UpdatePasswordState = {
  status: "idle",
  fieldErrors: {},
  error: null,
};

export default function UpdatePasswordForm() {
  const [state, action, isPending] = useActionState(
    updatePassword,
    initialState,
  );

  return (
    <div className="flex flex-col mt-30 max-w-md w-full mx-auto gap-6 animate-fade-in">
      <h1 className="text-xl font-bold">Nueva contraseña</h1>
      <p className="text-sm text-[#585858]">
        Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres, una
        mayúscula y un número.
      </p>

      <form className="flex flex-col gap-6" action={action}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input
            required
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className={cn(
              state?.fieldErrors?.password && "ring-2 ring-red-500",
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input
            required
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repite tu nueva contraseña"
            className={cn(
              state?.fieldErrors?.confirmPassword && "ring-2 ring-red-500",
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="flex justify-center items-center text-base bg-[#CDF545] hover:bg-[#c0e740] text-[#114821] font-semibold py-2 rounded-lg cursor-pointer transition-colors"
        >
          {isPending ? <Spinner /> : "Cambiar contraseña"}
        </Button>
      </form>

      <hr className="text-[#E5E5E5]" />

      <p className="text-center text-sm text-[#585858]">
        ¿Prefieres no cambiar tu contraseña?{" "}
        <Link
          href="/auth/signin"
          className="text-[#1C1C1C] font-semibold underline text-sm"
        >
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  );
}
