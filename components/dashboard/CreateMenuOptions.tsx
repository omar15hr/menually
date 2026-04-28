"use client";

import { ListIcon } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";

import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import IAIcon from "@/components/icons/IAIcon";
import { Button } from "@/components/ui/button";
import { createMenu } from "@/actions/menu.action";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

function SubmitButton({
  intent,
  variant = "default",
  className,
  children,
}: {
  intent: string;
  variant?: "default" | "outline";
  className?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      name="intent"
      value={intent}
      variant={variant}
      disabled={pending}
      className={className}
    >
      {pending ? <Spinner /> : null}
      {children}
    </Button>
  );
}

export function CreateMenuOptions() {
  const [state, formAction] = useActionState(createMenu, null);

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-2">
        <form
          action={formAction}
          className="relative h-90 border-2 bg-linear-to-b border-[#CDF545] rounded-xl p-8 flex flex-col items-center text-center gap-4"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#CDF545] text-[#114821] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            Recomendado
          </div>

          <div className="size-14 flex items-center justify-center bg-[#F1F5F9] rounded-xl self-start mb-2">
            <IAIcon />
          </div>

          <div className="flex-1 space-y-3 text-left w-full">
            <h3 className="text-lg font-bold text-[#0F172A]">Importar PDF</h3>
            <p className="text-[#64748B] text-sm leading-relaxed">
              Tienes tu carta en PDF o foto. La subes y en minutos tienes tu
              menú digital listo — sin escribir nada.
            </p>
          </div>

          <SubmitButton
            intent="import"
            className="w-full text-base bg-[#CDF545] hover:bg-[#c0e740] text-[#114821] font-semibold py-2 px-4 rounded-lg h-10 cursor-pointer transition-colors"
          >
            Empezar
          </SubmitButton>
        </form>

        <form
          action={formAction}
          className="border border-[#E2E8F0] rounded-xl p-8 flex flex-col items-center text-center gap-4"
        >
          <div className="size-14 flex items-center justify-center bg-[#F1F5F9] rounded-xl self-start mb-2">
            <ListIcon />
          </div>

          <div className="flex-1 space-y-3 text-left w-full">
            <h3 className="text-lg font-bold text-[#0F172A]">
              Crear Manualmente
            </h3>
            <p className="text-[#64748B] text-sm leading-relaxed">
              Prefieres armar tu carta desde cero. Agrega categorías y platos a
              tu ritmo, como tu quieras.
            </p>
          </div>

          <SubmitButton
            intent="manual"
            variant="outline"
            className="w-full border-[#E4E4E6] text-[#0F172A] hover:bg-gray-50 text-base font-semibold py-2 px-4 rounded-lg h-10 cursor-pointer transition-colors"
          >
            Crear desde cero
          </SubmitButton>
        </form>
      </div>

      <DialogFooter className="bg-transparent border-none p-0 mt-2 sm:justify-end">
        <DialogClose asChild>
          <Button
            variant="ghost"
            type="button"
            className="text-[#64748B] hover:text-[#0F172A] font-medium px-6 cursor-pointer"
          >
            Cancelar
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}
