import Image from "next/image";
import { ListIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
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
import IAIcon from "@/components/icons/IAIcon";
import { Button } from "@/components/ui/button";
import { createMenu } from "@/actions/menu.action";

export default async function WithoutMenu() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const createMenuManual = createMenu.bind(null, "manual");
  const createMenuImport = createMenu.bind(null, "ai");

  return (
    <>
      <div className="w-full mt-5 px-10 max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-extrabold text-left text-gray-900 mb-2 capitalize">
          {`Hola, ${profile?.full_name}`}
        </h1>
        <p className="text-[#64748B] text-base font-normal">
          Tu cuenta está lista. Solo falta crear tu menú.
        </p>
      </div>

      <div className="max-w-7xl bg-[#FBFBFA] border border-[#F1F1F2] rounded-2xl flex flex-col items-center justify-center text-center p-12 mx-10 my-6 relative overflow-hidden">
        <Image
          src="/images/create-menu-image.png"
          loading="eager"
          className="h-45 w-30"
          alt="Empty state"
          width={18}
          height={18}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Tu menú empieza aquí
        </h2>
        <p className="text-[#58606E] max-w-xl mb-8 text-base">
          Elige la opción que mejor se adapta a ti. Te toma menos de 5 minutos
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              id="tour-create-menu"
              className="bg-[#CDF545] hover:bg-[#bce43e] text-[#114821] font-semibold px-4 py-2 text-base rounded-lg transition-all cursor-pointer"
            >
              Crear mi menú
            </Button>
          </DialogTrigger>
          <DialogContent className="p-6 sm:p-10 rounded-2xl w-[95vw] sm:max-w-187.5">
            <DialogHeader className="mb-0 text-left">
              <DialogTitle className="text-2xl font-bold text-[#0F172A]">
                ¿Cómo quieres crear tu menú?
              </DialogTitle>
              <DialogDescription className="text-sm font-normal text-[#64748B] mt-1">
                Elige cómo empezar. Puedes cambiar o editar todo después.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-2">
              <div className="relative h-90 border-2 bg-linear-to-b border-[#CDF545] rounded-xl p-8 flex flex-col items-center text-center gap-4">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#CDF545] text-[#114821] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Recomendado
                </div>

                <div className="size-14 flex items-center justify-center bg-[#F1F5F9] rounded-xl self-start mb-2">
                  <IAIcon />
                </div>

                <div className="flex-1 space-y-3 text-left w-full">
                  <h3 className="text-lg font-bold text-[#0F172A]">
                    Importar PDF
                  </h3>
                  <p className="text-[#64748B] text-sm leading-relaxed">
                    Tienes tu carta en PDF o foto. La subes y en minutos tienes
                    tu menú digital listo — sin escribir nada.
                  </p>
                </div>

                <form className="w-full" action={createMenuImport}>
                  <Button
                    type="submit"
                    name="intent"
                    value="import"
                    className="w-full text-base bg-[#CDF545] hover:bg-[#c0e740] text-[#114821] font-semibold py-2 px-4 rounded-lg h-10 cursor-pointer transition-colors"
                  >
                    Empezar
                  </Button>
                </form>
              </div>

              <div className="border border-[#E2E8F0] rounded-xl p-8 flex flex-col items-center text-center gap-4">
                <div className="size-14 flex items-center justify-center bg-[#F1F5F9] rounded-xl self-start mb-2">
                  <ListIcon />
                </div>

                <div className="flex-1 space-y-3 text-left w-full">
                  <h3 className="text-lg font-bold text-[#0F172A]">
                    Crear Manualmente
                  </h3>
                  <p className="text-[#64748B] text-sm leading-relaxed">
                    Prefieres armar tu carta desde cero. Agrega categorías y
                    platos a tu ritmo, como tu quieras.
                  </p>
                </div>

                <form className="w-full" action={createMenuManual}>
                  <Button
                    type="submit"
                    name="intent"
                    value="manual"
                    variant="outline"
                    className="w-full border-[#E4E4E6] text-[#0F172A] hover:bg-gray-50 text-base font-semibold py-2 px-4 rounded-lg h-10 cursor-pointer transition-colors"
                  >
                    Crear desde cero
                  </Button>
                </form>
              </div>
            </div>

            <DialogFooter className="bg-transparent border-none p-0 mt-2 sm:justify-end">
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  className="text-[#64748B] hover:text-[#0F172A] font-medium px-6 cursor-pointer"
                >
                  Cancelar
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
