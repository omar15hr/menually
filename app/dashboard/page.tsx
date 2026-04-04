export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <form className="flex flex-col max-w-sm border p-4">
        <span>Formulario de menu</span>
        <input type="text" placeholder="nobre" className="border" />
        <button type="submit">Enviar</button>
      </form>

      <form className="flex flex-col max-w-sm border p-4">
        <span>Formulario de categoria</span>
        <input type="text" placeholder="nobre" className="border" />
        <button type="submit">Enviar</button>
      </form>

      <form className="flex flex-col max-w-sm border p-4">
        <span>Formulario de productos</span>
        <input type="text" placeholder="nobre" className="border" />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
