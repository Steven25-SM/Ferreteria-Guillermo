import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'

export default function Home() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    api.get('/products/featured').then(r => setProducts(r.data))
  }, [])

  return <>
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">SOLUCIONES PARA TU PROYECTO</span>
            <h1>Todo lo que necesitas para <span>construir mejor.</span></h1>
            <p>Encuentra herramientas, materiales y productos de ferretería. Consulta nuestro catálogo y solicita una cotización de forma rápida.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/catalogo">Ver catálogo →</Link>
              <Link className="btn btn-light" to="/cotizacion">Solicitar cotización</Link>
            </div>
            <div className="trust-row"><span>✓ Catálogo virtual</span><span>✓ Cotizaciones</span><span>✓ Pagos</span></div>
          </div>
          <div className="hero-showcase">
            <div className="showcase-badge">🔥 OFERTA SEMANAL</div>
            <div className="tool-illustration">🧰</div>
            <p>Kit profesional de herramientas</p>
            <div className="price-line"><strong>S/ 129.90</strong><del>S/ 159.90</del></div>
            <Link to="/catalogo" className="btn btn-primary full">Ver oferta</Link>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div><span className="eyebrow">EXPLORA</span><h2>Compra por categoría</h2></div>
          <Link to="/catalogo" className="text-link">Ver catálogo completo →</Link>
        </div>
        <div className="category-grid">
          {[
            ['🔨','Herramientas','Taladros, martillos y más'],
            ['💡','Electricidad','Cables, interruptores y accesorios'],
            ['🎨','Pintura','Pinturas, brochas y accesorios'],
            ['🧱','Construcción','Cemento y materiales'],
          ].map(([icon,name,text]) =>
            <Link key={name} className="category-card" to={`/catalogo?cat=${name}`}>
              <span>{icon}</span><h3>{name}</h3><p>{text}</p>
            </Link>
          )}
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">DESTACADOS</span><h2>Productos más buscados</h2></div>
            <Link to="/catalogo" className="text-link">Ver todos →</Link>
          </div>
          <div className="product-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      </section>

      <section className="section container">
        <div className="promo-banner">
          <div><span className="eyebrow">COTIZA SIN COMPLICACIONES</span><h2>¿Necesitas varios productos?</h2><p>Agrega lo que necesitas y envía una sola solicitud de cotización.</p></div>
          <Link className="btn btn-primary" to="/cotizacion">Crear cotización →</Link>
        </div>
      </section>

      <section className="section container">
        <div className="features-grid">
          {[
            ['📦','Amplio catálogo','Productos organizados por categorías.'],
            ['🧾','Cotizaciones','Solicita y revisa tus productos.'],
            ['💳','Pagos','Información clara para tus compras.'],
            ['💬','Atención','Facilitamos el contacto con la ferretería.'],
          ].map(([icon,title,text]) =>
            <div className="feature" key={title}><span>{icon}</span><div><h3>{title}</h3><p>{text}</p></div></div>
          )}
        </div>
      </section>
    </main>
    <Footer />
  </>
}
