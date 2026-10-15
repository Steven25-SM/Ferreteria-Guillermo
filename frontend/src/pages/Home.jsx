import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './home-v3.css'

const categories = [
  { name: 'Electricidad', description: 'Tomacorrientes, cables y cintas', image: '/reference/reference-2.jpg' },
  { name: 'Herramientas', description: 'Taladros, discos y accesorios', image: '/reference/reference-3.jpg' },
  { name: 'Pintura', description: 'Rodillos, brochas y sprays', image: '/reference/reference-4.jpg' },
  { name: 'Plomería', description: 'Accesorios PVC y llaves', image: '/reference/reference-5.jpg' },
  { name: 'Seguridad', description: 'Guantes y protección', image: '/reference/reference-6.jpg' },
  { name: 'Cuerdas y hogar', description: 'Rafia, alambre y accesorios', image: '/reference/reference-7.jpg' },
]
const money = n => `S/ ${Number(n || 0).toFixed(2)}`

export default function Home() {
  const [products, setProducts] = useState([])
  const [recommended, setRecommended] = useState([])
  const [selected, setSelected] = useState('Todos')
  const [query, setQuery] = useState('')
  const [error, setError] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [justAdded, setJustAdded] = useState(null)
  const { cart, count, total, addToCart, changeQty, removeItem } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data || [])).catch(() => setError(true))
    api.get('/recommendations').then(r => { const data = r.data; setRecommended(Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : []) }).catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    const base = recommended.length && selected === 'Todos' && !query ? recommended : products
    return base.filter(p => (selected === 'Todos' || p.category === selected) && (!query || `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()))).slice(0, 8)
  }, [products, recommended, selected, query])

  const add = p => {addToCart(p); setJustAdded(p.id); window.setTimeout(() => setJustAdded(null), 1300)}
  const selectCategory = name => {setSelected(name);document.getElementById('fg-best')?.scrollIntoView({behavior:'smooth', block:'start'})}
  const featured = products.find(p => /set profesional 108/i.test(p.name)) || products.find(p=>p.featured) || products[0]

  return <div className="fg-v3">
    <header className="fg-site-header"><div className="fg-wrap fg-nav">
      <Link to="/" className="fg-logo"><i/>FERRETERÍA GUILLERMO</Link>
      <nav><a href="#fg-categorias">Catálogo</a><a href="#fg-como">Cómo comprar</a><a href="#fg-ayuda">Pedidos</a></nav>
      <form onSubmit={e=>{e.preventDefault();document.getElementById('fg-best')?.scrollIntoView({behavior:'smooth'})}} className="fg-search">
        <input aria-label="Buscar productos" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar productos..."/><button aria-label="Buscar" type="submit">⌕</button>
      </form>
      {user ? <button className="fg-account" onClick={async()=>{await logout();navigate('/')}}>Salir</button> : <Link className="fg-account" to="/login">Ingresar</Link>}
      <button className="fg-cart-btn" onClick={()=>setDrawer(true)} aria-label={`Abrir carrito con ${count} productos`}><svg className="fg-cart-icon" xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.2 12.3a2 2 0 0 0 2 1.7h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg><span>Carrito</span><b>{count}</b></button>
    </div></header>
    <main>
      <div className="fg-hero"><div className="fg-wrap fg-hero-content">
        <div className="fg-copy"><h1>TODO PARA CONSTRUIR <span>MEJOR.</span></h1><p>Electricidad, plomería, pintura, herramientas y más. Compra desde el catálogo en pocos pasos.</p><div className="fg-actions"><a className="fg-btn" href="#fg-categorias">Ver catálogo</a><Link className="fg-btn outline" to="/carrito">Hacer un pedido</Link></div></div>
        <aside className="fg-deal"><div><small>OFERTA SEMANAL</small><h2>{featured?.name || 'Set profesional 108 piezas'}</h2></div><div className="fg-deal-price"><b>{money(featured?.price ?? 129.9)}</b>{featured?.oldPrice && <s>{money(featured.oldPrice)}</s>}</div><button className="fg-btn" onClick={()=>featured && add(featured)} disabled={!featured}>{featured ? (justAdded === featured.id?'Agregado ✓':'Agregar al carrito'):'Ver catálogo'}</button></aside>
      </div></div>
      <div className="fg-band"><div className="fg-wrap">{[['Catálogo amplio','Productos por categoría'],['Pedidos','Compra desde tu carrito'],['Pago por Yape','Verificamos tu pago'],['Atención directa','Contacto con la ferretería']].map(([title,desc])=><div key={title}><b>{title}</b><span>{desc}</span></div>)}</div></div>
      <section className="fg-section" id="fg-categorias"><div className="fg-wrap"><div className="fg-section-head"><h2>CATEGORÍAS</h2><button className="fg-link" onClick={()=>selectCategory('Todos')}>Ver todo el catálogo</button></div><div className="fg-cats">{categories.map((c,i)=><button key={c.name} className="fg-cat" style={{backgroundImage:`linear-gradient(90deg,rgba(8,13,17,.83),rgba(8,13,17,.17)),url('${c.image}')`}} onClick={()=>selectCategory(c.name)}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{c.name}</h3><small>{c.description}</small></div></button>)}</div></div></section>
      <section className="fg-section" id="fg-best"><div className="fg-wrap"><div className="fg-section-head"><div><h2>{selected==='Todos'?'MÁS VENDIDOS':selected.toUpperCase()}</h2><p>{selected==='Todos'?'Productos recomendados según las compras registradas.':'Explora los productos disponibles de esta categoría.'}</p></div>{selected!=='Todos'&&<button className="fg-link" onClick={()=>setSelected('Todos')}>Ver todos</button>}</div>
      {error && <p className="fg-notice">No se pudo conectar con el catálogo. Comprueba que el backend esté funcionando.</p>}
      <div className="fg-products">{filtered.map(p=><article className="fg-product" key={p.id}><div className="fg-product-photo">{p.imageUrl ? <img src={p.imageUrl} alt={p.name} loading="lazy"/> : <div className="fg-photo-fallback">FERRETERÍA<br/>GUILLERMO</div>}{p.oldPrice && <span className="fg-offer">OFERTA</span>}</div><div className="fg-product-info"><small>{p.category}</small><h3>{p.name}</h3><div className="fg-price"><b>{money(p.price)}</b>{p.oldPrice && <s>{money(p.oldPrice)}</s>}</div><button className={justAdded===p.id?'fg-add added':'fg-add'} onClick={()=>add(p)}>{justAdded===p.id?'Agregado ✓':'Agregar al carrito'}</button></div></article>)}{!filtered.length && !error && <div className="fg-notice">{products.length?'No encontramos productos con esos filtros.':'Cargando productos...'}</div>}</div>
      </div></section>
      <section className="fg-section" id="fg-como"><div className="fg-wrap"><div className="fg-section-head"><h2>CÓMO COMPRAR</h2></div><div className="fg-steps">{[['PASO 1','ELIGE','Busca por nombre o entra a una categoría.'],['PASO 2','ARMA TU CARRITO','Agrega todo lo de tu obra y ajusta cantidades.'],['PASO 3','PAGA CON YAPE','Envía tu pago y lo verificamos para confirmar tu pedido.']].map(([step,title,desc])=><div className="fg-step" key={step}><b>{step}</b><h3>{title}</h3><p>{desc}</p></div>)}</div></div></section>
      <section className="fg-section" id="fg-ayuda"><div className="fg-wrap"><div className="fg-quote"><div><h2>¿NECESITAS VARIOS PRODUCTOS?</h2><p>Reúne los artículos que necesitas en tu carrito y genera un solo pedido para pagar por Yape.</p></div><Link className="fg-btn" to="/carrito">Ir al carrito</Link></div></div></section>
    </main>
    <footer className="fg-footer"><div className="fg-wrap"><b>FERRETERÍA GUILLERMO</b><div className="fg-footer-meta"><span>Horario: lunes a sábado · 8:00 a 19:00</span><span>© {new Date().getFullYear()} Todos los derechos reservados</span></div></div></footer>
    <div className={'fg-shade'+(drawer?' open':'')} onClick={()=>setDrawer(false)} />
    <aside className={'fg-drawer'+(drawer?' open':'')} aria-hidden={!drawer}><div className="fg-drawer-head"><h2>TU CARRITO</h2><button onClick={()=>setDrawer(false)} aria-label="Cerrar carrito">×</button></div><div className="fg-drawer-items">{cart.length?cart.map(p=><div className="fg-drawer-item" key={p.id}><div><strong>{p.name}</strong><small>{money(p.price)} c/u</small></div><div className="fg-qty"><button onClick={()=>changeQty(p.id,-1)}>−</button><span>{p.qty}</span><button onClick={()=>changeQty(p.id,1)}>+</button></div><button className="fg-remove" onClick={()=>removeItem(p.id)}>×</button></div>):<p>Aún no agregaste productos.</p>}</div><div className="fg-drawer-foot"><div><strong>Total</strong><strong>{money(total)}</strong></div><Link className="fg-btn" to="/carrito" onClick={()=>setDrawer(false)}>Pagar con Yape</Link><small>Verificamos tu pago antes de confirmar el pedido.</small></div></aside>
  </div>
}
