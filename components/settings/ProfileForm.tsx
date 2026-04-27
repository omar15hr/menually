"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  updateContactData,
  changePassword,
} from "@/actions/profile.action";
import type { Profile } from "@/types/profile.types";

interface ProfileFormProps {
  profile: Profile;
}

const initialContactState = {
  status: "idle" as const,
  errors: {},
};

const initialPasswordState = {
  status: "idle" as const,
  errors: {},
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();

  // Contact data form state
  const [contactState, contactAction, isContactPending] = useActionState(
    updateContactData,
    initialContactState,
  );

  // Password form state
  const [passwordState, passwordAction, isPasswordPending] = useActionState(
    changePassword,
    initialPasswordState,
  );

  // Contact data toast
  useEffect(() => {
    if (contactState.status === "success") {
      toast.success(contactState.message);
      router.refresh();
    } else if (contactState.status === "error") {
      toast.error(contactState.message);
    }
  }, [contactState.status, contactState.message, router]);

  // Password toast and form reset
  useEffect(() => {
    if (passwordState.status === "success") {
      toast.success(passwordState.message);
      // Force form reset by reloading the page data
      router.refresh();
    } else if (passwordState.status === "error") {
      toast.error(passwordState.message);
    }
  }, [passwordState.status, passwordState.message, router]);

  return (
    <div className="grid md:grid-cols-[240px,1fr] gap-10 py-6 md:py-10 max-w-7xl mx-auto">
      {/* Contact Data Form */}
      <form action={contactAction} className="space-y-10">
        <Card>
          <CardContent className="p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1C1C1C]">
                Datos de contacto
              </h2>
              <p className="text-sm text-[#58606E] mt-1">
                Tus datos personales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]"
                >
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={profile.email ?? ""}
                  placeholder="correo@ejemplo.com"
                  className="border-[#E4E4E6] placeholder:text-[#58606E] h-12 w-120 max-w-md"
                />
                {contactState.errors?.email && (
                  <p className="text-sm text-red-500">
                    {contactState.errors.email[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone_number"
                  className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]"
                >
                  Número de teléfono
                </label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  defaultValue={profile.phone_number ?? ""}
                  placeholder="+56 9 98987788"
                  className="border-[#E4E4E6] placeholder:text-[#58606E] h-11 w-full max-w-md"
                />
                {contactState.errors?.phone_number && (
                  <p className="text-sm text-red-500">
                    {contactState.errors.phone_number[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <Button
                type="reset"
                variant="ghost"
                className="text-[#114821] h-10 font-bold cursor-pointer hover:bg-transparent"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isContactPending}
                className="bg-[#CDF545] text-[#114821] h-10 font-bold px-4 transition-all rounded-lg cursor-pointer disabled:opacity-50"
              >
                {isContactPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Password Change Form */}
      <form action={passwordAction} className="space-y-10">
        <Card>
          <CardContent className="p-8 space-y-8">
            <h2 className="text-2xl font-bold text-[#1C1C1C]">
              Cambio de contraseña
            </h2>

            <div className="flex flex-col gap-6 items-start">
              <div className="space-y-2">
                <label
                  htmlFor="currentPassword"
                  className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]"
                >
                  Ingresa tu contraseña actual
                </label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="Contraseña actual"
                  className="border-neutral-200 placeholder:text-[#58606E] h-11 w-120 max-w-md"
                />
                {passwordState.errors?.currentPassword && (
                  <p className="text-sm text-red-500">
                    {passwordState.errors.currentPassword[0]}
                  </p>
                )}
              </div>

              <div className="flex gap-6 items-start">
                <div className="space-y-2">
                  <label
                    htmlFor="newPassword"
                    className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]"
                  >
                    Crea una nueva contraseña
                  </label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    className="border-neutral-200 placeholder:text-[#58606E] h-11 w-120 max-w-md"
                  />
                  {passwordState.errors?.newPassword && (
                    <p className="text-sm text-red-500">
                      {passwordState.errors.newPassword[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-1.5 text-base font-semibold text-[#1C1C1C]"
                  >
                    Confirma la nueva contraseña
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repetir nueva contraseña"
                    className="border-neutral-200 placeholder:text-[#58606E] h-11 w-120 max-w-md"
                  />
                  {passwordState.errors?.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {passwordState.errors.confirmPassword[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="reset"
                variant="ghost"
                className="text-[#114821] h-10 font-bold cursor-pointer hover:bg-transparent"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPasswordPending}
                className="bg-[#CDF545] text-[#114821] h-10 font-bold px-4 transition-all rounded-lg cursor-pointer disabled:opacity-50"
              >
                {isPasswordPending ? "Cambiando..." : "Cambiar contraseña"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}