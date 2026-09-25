export default function Payments() {
  return <main>
    <section className="page-hero"><div className="container"><span className="eyebrow">PAGOS</span><h1>Opciones de pago</h1><p>Consulta las alternativas disponibles para tus compras.</p></div></section>
    <section className="section container">
      <div className="payment-grid">
        <div className="payment-card"><div className="payment-visual">💳</div><h2>Tarjeta</h2><p>Pago con tarjeta de débito o crédito.</p><div className="payment-icons">VISA · MASTERCARD</div></div>
        <div className="payment-card"><div className="payment-visual">📱</div><h2>Yape / Plin</h2><p>Realiza el pago desde tu celular.</p><div className="payment-code">QR</div></div>
        <div className="payment-card"><div className="payment-visual">🏦</div><h2>Transferencia</h2><p>Solicita los datos bancarios al momento de confirmar tu pedido.</p></div>
      </div>
      <div className="notice"><strong>Importante:</strong> esta versión es una interfaz demostrativa para el proyecto académico. La conexión con una pasarela de pagos real se implementaría en una etapa posterior.</div>
    </section>
  </main>
}
