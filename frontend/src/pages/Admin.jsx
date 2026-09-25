import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Admin() {
  const [products, setProducts] = useState([])
  const [quotes, setQuotes] = useState([])
  const [toast, setToast] = useState('')

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data))
    api.get('/quotes/latest').then(r => setQuotes(r.data))
  }, [])

  const notify = text => {
    setToast(text)
    setTimeout(() => setToast(''), 2500)
  }

  return <main className="admin-body">
    <div className="container admin-container">
      <div className="admin-title">
        <div><span className="eyebrow">PANEL DE CONTROL</span><h1>Resumen del negocio</h1><p>Gestión general de productos, cotizaciones y promociones.</p></div>
        <button className="btn btn-primary" onClick={() => notify('Producto registrado correctamente')}>+ Nuevo producto</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><span>📦</span><small>Productos</small><strong>{products.length}</strong><em>Catálogo actual</em></div>
        <div className="stat-card"><span>🧾</span><small>Cotizaciones</small><strong>{quotes.length}</strong><em>Últimas registradas</em></div>
        <div className="stat-card"><span>💳</span><small>Ventas</small><strong>S/ 18.4K</strong><em>Mes actual</em></div>
        <div className="stat-card"><span>👥</span><small>Clientes</small><strong>286</strong><em>+24 nuevos</em></div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="card-header"><h2>Últimas cotizaciones</h2><a href="/cotizacion">Ver todas</a></div>
          <div className="table-wrap">
            <table><thead><tr><th>ID</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
            <tbody>{quotes.map(q => <tr key={q.id}><td>#{String(q.id).padStart(3,'0')}</td><td>{q.clientName}</td><td>S/ {Number(q.total).toFixed(2)}</td><td><span className={`status ${q.status.toLowerCase()}`}>{q.status}</span></td></tr>)}</tbody></table>
          </div>
        </section>
        <section className="dashboard-card">
          <div className="card-header"><h2>Ventas del mes</h2><span>2026</span></div>
          <div className="chart">{['ENE','FEB','MAR','ABR','MAY','JUN'].map((m,i)=><div key={m} style={{height:`${[45,62,55,78,68,88][i]}%`}}><b>{m}</b></div>)}</div>
        </section>
      </div>

      <div className="admin-modules">
        <a href="/catalogo"><span>📦</span><b>Gestión de productos</b><small>Registrar y actualizar</small></a>
        <a href="/cotizacion"><span>🧾</span><b>Solicitudes</b><small>Revisar cotizaciones</small></a>
        <a href="/pagos"><span>💳</span><b>Pagos</b><small>Control de operaciones</small></a>
        <a href="#" onClick={e=>{e.preventDefault();notify('Módulo de promociones seleccionado')}}><span>🔥</span><b>Promociones</b><small>Destacar productos</small></a>
      </div>
    </div>
    {toast && <div className="toast">{toast}</div>}
  </main>
}
