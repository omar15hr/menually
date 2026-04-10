import Image from "next/image";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateMenuOptions } from "./CreateMenuOptions";

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
              className="w-fit text-base bg-[#CDF545] hover:bg-[#c0e740] text-[#114821] font-semibold py-2 px-4 rounded-lg h-10 cursor-pointer transition-colors"
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

            <CreateMenuOptions />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
