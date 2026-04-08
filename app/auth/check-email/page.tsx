import Image from "next/image";

export default function CheckEmailPage() {
  return (
    <div className="flex flex-col mt-30 max-w-md w-full justify-center items-center mx-auto gap-2 animate-fade-in">
      <Image
        src="/images/success.png"
        alt="Imagen de check exitoso"
        width={100}
        height={100}
      />
      <h1 className="text-2xl font-bold mb-8">¡Casi listo!</h1>
      <p className="text-[#585858] text-center">
        Hemos enviado a tu correo electrónico con los siguientes pasos. Si no lo
        ves en tu bandeja de entrada, revisa tu carpeta de spam o correo no
        deseado.
      </p>
    </div>
  );
}
