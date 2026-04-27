"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteMenu } from "@/actions/menu.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const initialState = {
  success: false,
  message: "",
  errors: {},
};

export function DeleteMenuForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(deleteMenu, initialState);

  useEffect(() => {
    if (!state?.message) return;

    if (state.success) {
      setIsOpen(false);
      toast.success(state.message);
      router.push("/dashboard");
      router.refresh();
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <form id="delete-menu-form" action={formAction}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            disabled={isPending}
            className="bg-[#B60000] text-white h-10 font-bold px-4 transition-all rounded-lg cursor-pointer disabled:opacity-50"
          >
            Eliminar menú
          </Button>
        </DialogTrigger>

        <DialogContent showCloseButton className="sm:max-w-125 p-8">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-[#0F172A] font-bold text-2xl leading-tight">
              ¿Estás seguro que querés eliminar tu menú?
            </DialogTitle>
            <DialogDescription className="text-[#64748B] text-base">
              Se eliminarán permanentemente platos, categorías y fotos. Esta
              acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="bg-transparent border-none p-0 mt-6 sm:justify-end gap-3">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="text-[#475569] font-semibold hover:bg-gray-100 h-11 px-6 cursor-pointer"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="delete-menu-form"
              disabled={isPending}
              className="bg-[#B60000] hover:bg-[#B60000]/90 text-white font-semibold h-11 px-6 rounded-lg cursor-pointer"
            >
              {isPending ? "Eliminando..." : "Eliminar menú"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
