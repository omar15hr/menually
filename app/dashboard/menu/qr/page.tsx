import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QrDisplay } from "@/components/menu/QrDisplay";
import { generateQrCode } from "@/actions/generateQrCode.action";

export default async function QrPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's menu
  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!menu) {
    return (
      <div className="flex flex-col w-full max-w-md bg-white border border-[#E4E4E6] h-screen">
        <div className="flex flex-col p-4 border-b">
          <h2 className="text-[#0F172A] text-base font-extrabold">QR y enlace</h2>
          <p className="text-[#58606E] text-sm">
            No tienes un menú configurado.
          </p>
        </div>
      </div>
    );
  }

  // Generate or get QR code
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const menuUrl = `${baseUrl}/menu/${menu.slug}`;

  let qrUrl: string | null = null;
  
  const result = await generateQrCode(menu.id, menu.slug);
  if (result.success && result.qrUrl) {
    qrUrl = result.qrUrl;
  }

  // If no QR URL, we'll still show the URL but not the QR image
  return (
    <div className="flex flex-col w-full max-w-md bg-white border border-[#E4E4E6] h-screen">
      <div className="flex flex-col p-4 border-b">
        <h2 className="text-[#0F172A] text-base font-extrabold">QR y enlace</h2>
        <p className="text-[#58606E] text-sm">
          Listo para compartir: usa tu QR o envía el link.
        </p>
      </div>

      {qrUrl ? (
        <QrDisplay qrUrl={qrUrl} menuSlug={menu.slug} />
      ) : (
        <div className="flex flex-col gap-4 p-4">
          <p className="text-[#58606E] text-sm text-center">
            Generando QR...
          </p>
        </div>
      )}
    </div>
  );
}