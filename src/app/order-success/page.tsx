export const metadata = {
  title: "Pedido exitoso – Serena Intimates",
  description: "Confirmación del pedido completado con éxito."
};

export default async function OrderSuccessPage({ searchParams }: { searchParams: { id?: string } }) {
  const { id } = await searchParams;
  const orderId = id ?? "";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-serena-cream text-serena-charcoal">
      <h1 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h1>
      {orderId ? (
        <p className="text-lg mb-2">Tu número de orden es <strong>{orderId}</strong>.</p>
      ) : (
        <p className="text-lg mb-2">Tu pedido se ha procesado correctamente.</p>
      )}
      <a href="/" className="mt-4 text-serena-gold underline">
        Volver al inicio
      </a>
    </div>
  );
}
