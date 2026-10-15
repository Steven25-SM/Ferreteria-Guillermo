import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const emptyProduct = {
  imageUrl: '',
  name: '',
  category: 'Herramientas',
  price: '',
  oldPrice: '',
  rating: '4.5',
  featured: false
}

const statusMeta = {
  PENDING_PAYMENT: { label: 'Esperando pago', tone: 'slate' },
  PAYMENT_REVIEW: { label: 'Verificar Yape', tone: 'violet' },
  PAYMENT_REJECTED: { label: 'Pago rechazado', tone: 'red' },
  PAID: { label: 'Pagado', tone: 'green' },
  PREPARING: { label: 'Preparando', tone: 'orange' },
  READY: { label: 'Listo para recoger', tone: 'blue' },
  DELIVERED: { label: 'Entregado', tone: 'teal' }
}

const quoteStatusLabel = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  PAID: 'Pagada'
}

const orderNextActions = {
  PAID: { value: 'PREPARING', label: 'Pasar a preparando' },
  PREPARING: { value: 'READY', label: 'Marcar como listo' },
  READY: { value: 'DELIVERED', label: 'Marcar como entregado' }
}

const menuItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Pedidos' },
  { key: 'products', label: 'Productos' },
  { key: 'profile', label: 'Perfil' }
]

function formatCurrency(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function Admin() {
  const navigate = useNavigate()
  const { user, logout, updateProfile } = useAuth()
  const [activeView, setActiveView] = useState('dashboard')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [yapeConfig, setYapeConfig] = useState({})
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectNote, setRejectNote] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || ''
  })

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || '',
      avatarUrl: user?.avatarUrl || ''
    })
  }, [user])

  const load = async () => {
    setLoading(true)
    try {
      const [p, o, pay] = await Promise.all([
        api.get('/products'),
        api.get('/admin/orders'),
        api.get('/payments/config')
      ])
      setProducts(p.data)
      setOrders(o.data)
      setYapeConfig(pay.data)
      setError('')
    } catch {
      setError('No se pudieron cargar los datos del panel administrativo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const notify = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 2500)
  }

  const openNew = () => {
    setEditing('new')
    setForm(emptyProduct)
  }

  const openEdit = (product) => {
    setEditing(product.id)
    setForm({
      name: product.name,
      imageUrl: product.imageUrl || '',
      category: product.category,
      price: product.price,
      oldPrice: product.oldPrice || '',
      rating: product.rating || '4.5',
      featured: product.featured
    })
  }

  const handleProductImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1024 * 1024) {
      setError('La imagen debe ser JPG, PNG o WebP y pesar máximo 1 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setForm(old => ({ ...old, imageUrl: String(reader.result || '') }))
    reader.readAsDataURL(file)
  }

  const saveProduct = async (e) => {
    e.preventDefault()
    setError('')
    const payload = {
      ...form,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      rating: Number(form.rating)
    }
    try {
      if (editing === 'new') await api.post('/products', payload)
      else await api.put(`/products/${editing}`, payload)
      setEditing(null)
      notify(editing === 'new' ? 'Producto registrado correctamente.' : 'Producto actualizado correctamente.')
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el producto.')
    }
  }

  const removeProduct = async (product) => {
    if (!window.confirm(`¿Eliminar “${product.name}”?`)) return
    try {
      await api.delete(`/products/${product.id}`)
      notify('Producto eliminado del catálogo.')
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar. Puede estar asociado a una venta o cotización.')
    }
  }

  const updateOrder = async (id, type, action, note = '') => {
    try {
      await api.patch(
        type === 'payment' ? `/admin/orders/${id}/payment` : `/admin/orders/${id}/fulfillment`,
        type === 'payment' ? { note } : null,
        { params: type === 'payment' ? { action } : { status: action } }
      )
      setRejectingId(null)
      setRejectNote('')
      notify('Pedido actualizado correctamente.')
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar el pedido.')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const uploadAvatar = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setProfileForm(current => ({ ...current, avatarUrl: String(reader.result || '') }))
    reader.readAsDataURL(file)
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setError('')
    try {
      await updateProfile(profileForm)
      notify('Perfil del administrador actualizado.')
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el perfil.')
    } finally {
      setSavingProfile(false)
    }
  }

  const stats = useMemo(() => {
    const paidStatuses = ['PAID', 'PREPARING', 'READY', 'DELIVERED']
    const revenue = orders.filter(order => paidStatuses.includes(order.status)).reduce((sum, order) => sum + Number(order.total || 0), 0)
    const pendingReview = orders.filter(order => order.status === 'PAYMENT_REVIEW').length
    const inProgress = orders.filter(order => ['PAID', 'PREPARING', 'READY'].includes(order.status)).length
    const delivered = orders.filter(order => order.status === 'DELIVERED').length
    return { revenue, pendingReview, inProgress, delivered }
  }, [orders])

  const categoryData = useMemo(() => {
    const map = {}
    for (const product of products) map[product.category] = (map[product.category] || 0) + 1
    const max = Math.max(...Object.values(map), 1)
    return Object.entries(map).map(([label, value]) => ({ label, value, percentage: (value / max) * 100 }))
  }, [products])

  const statusData = useMemo(() => {
    const map = {}
    for (const order of orders) {
      const label = statusMeta[order.status]?.label || order.status
      map[label] = (map[label] || 0) + 1
    }
    const max = Math.max(...Object.values(map), 1)
    return Object.entries(map).map(([label, value]) => ({ label, value, percentage: (value / max) * 100 }))
  }, [orders])

  const pendingBadge = stats.pendingReview > 0 ? stats.pendingReview : ''
  const activeTitle = menuItems.find(item => item.key === activeView)?.label || 'Dashboard'
  const initials = (user?.name || 'FG').split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase()

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand-block">
          <span className="admin-brand-logo">FG</span>
          <div>
            <small>Ferretería</small>
            <strong>Guillermo</strong>
          </div>
        </div>

        <div className="admin-profile-card compact">
          <div className="admin-avatar-wrap">
            {profileForm.avatarUrl ? <img src={profileForm.avatarUrl} alt="Foto de perfil del administrador" /> : <span>{initials}</span>}
          </div>
          <h3>Administrador</h3>
        </div>

        <nav className="admin-menu">
          {menuItems.map(item => (
            <button key={item.key} className={`admin-menu-item ${activeView === item.key ? 'active' : ''}`} onClick={() => setActiveView(item.key)}>
              <strong>{item.label}</strong>
              {item.key === 'orders' && pendingBadge ? <b className="admin-badge">{pendingBadge}</b> : null}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link className="btn btn-light full" to="/">Ver tienda</Link>
          <button className="btn btn-primary full" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <span className="eyebrow">PANEL ADMINISTRATIVO</span>
            <h1>{activeTitle}</h1>
            <p>Diseñado para operar la tienda sin mezclarlo con la interfaz de clientes.</p>
          </div>
          <div className="admin-topbar-actions">
            <div className="admin-date-chip">{new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <button className="btn btn-light" onClick={load}>{loading ? 'Actualizando…' : 'Actualizar datos'}</button>
          </div>
        </header>

        {error && <div className="admin-error">⚠ {error}<button onClick={() => setError('')}>×</button></div>}

        {activeView === 'dashboard' && (
          <div className="admin-view-stack">
            <section className="admin-stat-grid">
              <article className="admin-stat-card accent-gold"><small>Ventas confirmadas</small><strong>{formatCurrency(stats.revenue)}</strong><span>Pedidos aprobados y en proceso</span></article>
              <article className="admin-stat-card accent-purple"><small>Pagos por revisar</small><strong>{stats.pendingReview}</strong><span>Clientes esperando validación</span></article>
              <article className="admin-stat-card accent-blue"><small>Pedidos activos</small><strong>{stats.inProgress}</strong><span>Pagados, preparando o listos</span></article>
              <article className="admin-stat-card accent-teal"><small>Entregados</small><strong>{stats.delivered}</strong><span>Pedidos completados</span></article>
            </section>

            <section className="admin-overview-grid">
              <article className="admin-panel-card">
                <div className="admin-section-heading">
                  <div>
                    <h2>Vista rápida del negocio</h2>
                    <p>Resumen para abrir el panel y entender qué requiere atención.</p>
                  </div>
                </div>
                <div className="admin-mini-grid">
                  <div><small>Productos en catálogo</small><strong>{products.length}</strong></div>
                  <div><small>Productos destacados</small><strong>{products.filter(p => p.featured).length}</strong></div>
                  <div><small>Pagos por verificar</small><strong>{stats.pendingReview}</strong></div>
                  <div><small>Pedidos totales</small><strong>{orders.length}</strong></div>
                </div>
              </article>

              <article className="admin-panel-card">
                <div className="admin-section-heading">
                  <div>
                    <h2>Yape configurado</h2>
                    <p>Datos que el cliente verá al momento de pagar.</p>
                  </div>
                </div>
                <div className="admin-yape-summary">
                  <div><small>Titular</small><strong>{yapeConfig.owner || 'No configurado'}</strong></div>
                  <div><small>Celular</small><strong>{yapeConfig.phone || 'No configurado'}</strong></div>
                  <div><small>QR</small><strong>{yapeConfig.qrUrl ? 'Cargado' : 'No cargado'}</strong></div>
                </div>
              </article>
            </section>

            <section className="admin-overview-grid wide">
              <article className="admin-panel-card">
                <div className="admin-section-heading">
                  <div>
                    <h2>Productos por categoría</h2>
                    <p>Distribución actual del catálogo.</p>
                  </div>
                </div>
                <div className="admin-bar-chart">
                  {categoryData.length ? categoryData.map(item => (
                    <div key={item.label} className="admin-bar-row">
                      <div className="admin-bar-copy"><strong>{item.label}</strong><small>{item.value} productos</small></div>
                      <div className="admin-bar-track"><span style={{ width: `${item.percentage}%` }} /></div>
                    </div>
                  )) : <div className="table-empty">Todavía no hay productos registrados.</div>}
                </div>
              </article>

              <article className="admin-panel-card">
                <div className="admin-section-heading">
                  <div>
                    <h2>Estados de pedidos</h2>
                    <p>Ayuda a detectar cuellos de botella.</p>
                  </div>
                </div>
                <div className="admin-bar-chart">
                  {statusData.length ? statusData.map(item => (
                    <div key={item.label} className="admin-bar-row">
                      <div className="admin-bar-copy"><strong>{item.label}</strong><small>{item.value} pedidos</small></div>
                      <div className="admin-bar-track alt"><span style={{ width: `${item.percentage}%` }} /></div>
                    </div>
                  )) : <div className="table-empty">Todavía no hay pedidos.</div>}
                </div>
              </article>
            </section>
          </div>
        )}

        {activeView === 'orders' && (
          <div className="admin-view-stack">
            <section className="admin-panel-card">
              <div className="admin-section-heading">
                <div>
                  <h2>Pedidos y validación manual de Yape</h2>
                  <p>La idea es que tu tío entienda rápido quién pagó, cuánto pagó y qué debe entregar.</p>
                </div>
              </div>
              <div className="admin-order-list">
                {orders.map(order => {
                  const currentStatus = statusMeta[order.status] || { label: order.status, tone: 'slate' }
                  const nextAction = orderNextActions[order.status]
                  return (
                    <article key={order.id} className="admin-order-card">
                      <div className="admin-order-head">
                        <div>
                          <small>Pedido</small>
                          <h3>FG-{String(order.id).padStart(6, '0')}</h3>
                          <p>{formatDate(order.createdAt)}</p>
                        </div>
                        <span className={`admin-status-pill ${currentStatus.tone}`}>{currentStatus.label}</span>
                      </div>

                      <div className="admin-order-grid">
                        <div>
                          <small>Cliente</small>
                          <strong>{order.customerName}</strong>
                          <p>{order.customerEmail}<br />{order.customerPhone}</p>
                        </div>
                        <div>
                          <small>Pago reportado</small>
                          <strong>{order.payerName || 'Aún no reportado'}</strong>
                          <p>Operación: {order.paymentReference || '—'}<br />{formatDate(order.paymentReportedAt)}</p>
                        </div>
                        <div>
                          <small>Total</small>
                          <strong>{formatCurrency(order.total)}</strong>
                          <p>Artículos: {order.items?.length || 0}</p>
                        </div>
                      </div>

                      <div className="admin-order-items">
                        {(order.items || []).map(item => (
                          <div key={item.id} className="admin-order-item-line">
                            <span>{item.product.name}</span>
                            <small>{item.quantity} × {formatCurrency(item.unitPrice)}</small>
                            <strong>{formatCurrency(Number(item.unitPrice) * Number(item.quantity))}</strong>
                          </div>
                        ))}
                      </div>

                      {order.paymentReviewNote && <div className="admin-note-box danger">Motivo / observación: {order.paymentReviewNote}</div>}

                      <div className="admin-order-actions">
                        {order.status === 'PAYMENT_REVIEW' && (
                          <>
                            <button className="btn btn-primary" onClick={() => updateOrder(order.id, 'payment', 'approve')}>Confirmar pago</button>
                            <button className="btn btn-light" onClick={() => { setRejectingId(order.id); setRejectNote(order.paymentReviewNote || '') }}>Rechazar pago</button>
                          </>
                        )}
                        {nextAction && (
                          <button className="btn btn-light" onClick={() => updateOrder(order.id, 'fulfillment', nextAction.value)}>{nextAction.label}</button>
                        )}
                      </div>

                      {rejectingId === order.id && (
                        <div className="admin-inline-review">
                          <label>
                            Motivo del rechazo
                            <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Ejemplo: no coincide el monto o no aparece el abono en Yape." />
                          </label>
                          <div className="admin-inline-actions">
                            <button className="btn btn-light" onClick={() => { setRejectingId(null); setRejectNote('') }}>Cancelar</button>
                            <button className="btn btn-primary" onClick={() => updateOrder(order.id, 'payment', 'reject', rejectNote || 'No coincide el abono informado')}>Confirmar rechazo</button>
                          </div>
                        </div>
                      )}
                    </article>
                  )
                })}
                {!orders.length && !loading && <div className="table-empty">Todavía no hay pedidos registrados.</div>}
              </div>
            </section>
          </div>
        )}

        {activeView === 'products' && (
          <div className="admin-view-stack">
            <section className="admin-panel-card">
              <div className="admin-section-heading between">
                <div>
                  <h2>Catálogo de productos</h2>
                  <p>Desde aquí puedes crear, editar o eliminar productos del catálogo.</p>
                </div>
                <button className="btn btn-primary" onClick={openNew}>+ Nuevo producto</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Destacado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td><span className="admin-product-name"><i>{product.imageUrl ? <img className="admin-table-image" src={product.imageUrl} alt="" /> : <span className="admin-table-placeholder">FG</span>}</i>{product.name}</span></td>
                        <td>{product.category}</td>
                        <td>{formatCurrency(product.price)}</td>
                        <td>{product.featured ? 'Sí' : 'No'}</td>
                        <td className="row-actions">
                          <button onClick={() => openEdit(product)}>Editar</button>
                          <button className="danger-link" onClick={() => removeProduct(product)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!products.length && !loading && <div className="table-empty">No hay productos todavía.</div>}
              </div>
            </section>
          </div>
        )}

        {activeView === 'profile' && (
          <div className="admin-view-stack">
            <section className="admin-profile-grid">
              <article className="admin-panel-card">
                <div className="admin-section-heading">
                  <div>
                    <h2>Perfil del administrador</h2>
                    <p>Puedes personalizar el panel con tu nombre, celular y foto.</p>
                  </div>
                </div>
                <form className="admin-profile-form" onSubmit={saveProfile}>
                  <div className="admin-profile-preview">
                    <div className="admin-avatar-large">
                      {profileForm.avatarUrl ? <img src={profileForm.avatarUrl} alt="Vista previa de perfil" /> : <span>{initials}</span>}
                    </div>
                    <div>
                      <label className="btn btn-light admin-upload-btn">
                        Cargar foto
                        <input type="file" accept="image/*" onChange={uploadAvatar} hidden />
                      </label>
                      <button type="button" className="text-link danger-link" onClick={() => setProfileForm(current => ({ ...current, avatarUrl: '' }))}>Quitar foto</button>
                    </div>
                  </div>
                  <div className="form-grid">
                    <label>
                      Nombre visible
                      <input value={profileForm.name} onChange={e => setProfileForm(current => ({ ...current, name: e.target.value }))} required maxLength="120" />
                    </label>
                    <label>
                      Celular
                      <input value={profileForm.phone} onChange={e => setProfileForm(current => ({ ...current, phone: e.target.value }))} pattern="[0-9]{9}" maxLength="9" placeholder="999888777" />
                    </label>
                  </div>
                  <label>
                    Foto de perfil (URL/base64)
                    <textarea value={profileForm.avatarUrl} onChange={e => setProfileForm(current => ({ ...current, avatarUrl: e.target.value }))} rows="4" placeholder="Puedes pegar una URL o usar el botón para cargar la imagen." />
                  </label>
                  <div className="modal-actions">
                    <button className="btn btn-primary" disabled={savingProfile}>{savingProfile ? 'Guardando…' : 'Guardar perfil'}</button>
                  </div>
                </form>
              </article>

              <article className="admin-panel-card">
                <div className="admin-section-heading">
                  <div>
                    <h2>Configuración visible para pagos Yape</h2>
                    <p>Estos datos vienen del backend para evitar confusiones en la web.</p>
                  </div>
                </div>
                <div className="admin-yape-config-box">
                  <div><small>Titular Yape</small><strong>{yapeConfig.owner || 'No configurado'}</strong></div>
                  <div><small>Celular Yape</small><strong>{yapeConfig.phone || 'No configurado'}</strong></div>
                  <div><small>QR cargado</small><strong>{yapeConfig.qrUrl ? 'Sí' : 'No'}</strong></div>
                  <div className="admin-note-box">
                    <strong>Cómo cambiarlo</strong>
                    <p>Actualiza las variables del backend `YAPE_OWNER_NAME`, `YAPE_PHONE` y `YAPE_QR_URL`, luego reinicia el servidor.</p>
                  </div>
                </div>
              </article>
            </section>
          </div>
        )}
      </section>

      {editing && (
        <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setEditing(null) }}>
          <form className="product-modal" onSubmit={saveProduct}>
            <div className="modal-head">
              <div>
                <span className="eyebrow">CATÁLOGO</span>
                <h2>{editing === 'new' ? 'Nuevo producto' : 'Editar producto'}</h2>
              </div>
              <button type="button" onClick={() => setEditing(null)}>×</button>
            </div>
            <div className="form-grid">
              <label>Nombre<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
              <label>Categoría<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option>Herramientas</option><option>Electricidad</option><option>Pintura</option><option>Construcción</option></select></label>
              <label>Precio<input type="number" min="0.01" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></label>
              <label>Precio anterior<input type="number" min="0.01" step="0.01" value={form.oldPrice} onChange={e => setForm({ ...form, oldPrice: e.target.value })} /></label>
              <label className="admin-image-editor">Imagen del producto
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleProductImage(e)} />
                <small>JPG, PNG o WebP, máximo 1 MB. También puedes usar una URL HTTPS.</small>
                <input type="url" placeholder="https://.../producto.webp" value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl} onChange={e => setForm(old => ({ ...old, imageUrl: e.target.value }))} />
                {form.imageUrl && <img className="admin-product-preview" src={form.imageUrl} alt="Vista previa del producto" />}
              </label>
              <label>Valoración<input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} /></label>
            </div>
            <label className="check-line"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Mostrar como producto destacado</label>
            <div className="modal-actions">
              <button type="button" className="btn btn-light" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn btn-primary">Guardar producto</button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </main>
  )
}
