export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <a className="brand light" href="/">Ferretería <b>Guillermo</b></a>
          <p>Soluciones para construcción, mantenimiento y hogar.</p>
        </div>
        <div>
          <h4>Enlaces</h4>
          <a href="/catalogo">Catálogo</a>
          <a href="/carrito">Carrito</a>
          <a href="/mis-pedidos">Mis pedidos</a>
        </div>
        <div>
          <h4>Contacto</h4>
          <p>📍 Lima, Perú</p>
          <p>📞 +51 999 999 999</p>
          <p>✉ contacto@ferreteriaguillermo.com</p>
        </div>
      </div>
      <div className="copyright">© 2026 Ferretería Guillermo. Proyecto académico PFC.</div>
    </footer>
  )
}
