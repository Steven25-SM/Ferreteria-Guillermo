import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const stepLabels = ['Revisa tu pedido', 'Realiza el Yape', 'Reporta el abono', 'Esperar verificación']

function formatCurrency(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`
}

export default function Checkout() {
  const { cart, total, clearCart, changeQty, removeItem } = useCart()
  const { user, updatePhone } = useAuth()
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '')
  const [phoneSaved, setPhoneSaved] = useState(Boolean(user?.phone))
  const [config, setConfig] = useState({})
  const [order, setOrder] = useState(null)
  const [reference, setReference] = useState('')
  const [payer, setPayer] = useState(user?.name || '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    api.get('/payments/config').then(r => setConfig(r.data)).catch(() => setError('No se pudo cargar la información de Yape.'))
  }, [])

  const subtotal = useMemo(() => Number(order?.total ?? total), [order, total])
  const orderCode = order ? `FG-${String(order.id).padStart(6, '0')}` : 'Se generará al continuar'
  const activeStep = done ? 4 : order ? 3 : 1

  const createOrder = async () => {
    setError('')
    setBusy(true)
    try {
      if (!phoneSaved) {
        await updatePhone(customerPhone)
        setPhoneSaved(true)
      }
      const { data } = await api.post('/orders', { items: cart.map(p => ({ productId: p.id, quantity: p.qty })) })
      setOrder(data)
    } catch (e) {
      setError(e.response?.data?.message || 'No se pudo generar el pedido.')
    } finally {
      setBusy(false)
    }
  }

  const reportPayment = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.post(`/orders/${order.id}/report-payment`, {
        operationNumber: reference.trim(),
        payerName: payer.trim()
      })
      setDone(true)
      clearCart()
    } catch (e) {
      setError(e.response?.data?.message || 'No se pudo informar el pago.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <main className="checkout-shell">
        <section className="checkout-wrap container">
          <div className="checkout-success-card">
            <div className="checkout-success-icon">✓</div>
            <span className="eyebrow">PAGO REPORTADO</span>
            <h1>Tu pedido fue enviado a verificación</h1>
            <p>
              Registramos el pedido <b>{orderCode}</b>. La ferretería revisará el abono en su Yape y, cuando lo confirme,
              comenzará la preparación de tus productos.
            </p>
            <div className="checkout-success-grid">
              <div>
                <small>Cliente</small>
                <strong>{user?.name}</strong>
              </div>
              <div>
                <small>Celular</small>
                <strong>{customerPhone}</strong>
              </div>
              <div>
                <small>Total</small>
                <strong>{formatCurrency(order?.total)}</strong>
              </div>
              <div>
                <small>Estado actual</small>
                <strong>Pago en revisión</strong>
              </div>
            </div>
            <div className="checkout-success-actions">
              <Link className="btn btn-primary" to="/mis-pedidos">Seguir mi pedido</Link>
              <Link className="btn btn-light" to="/catalogo">Seguir comprando</Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="checkout-shell">
      <section className="checkout-wrap container">
        <div className="checkout-main">
          <div className="checkout-heading">
            <span className="eyebrow">PAGO DIRECTO POR YAPE</span>
            <h1>Compra simple y fácil de entender</h1>
            <p>
              Primero confirmamos tu pedido, luego te mostramos los datos oficiales para yapear y finalmente registras el
              abono para que la ferretería lo verifique.
            </p>
          </div>

          <div className="checkout-stepper">
            {stepLabels.map((label, index) => {
              const step = index + 1
              const status = step < activeStep ? 'done' : step === activeStep ? 'active' : 'pending'
              return (
                <div key={label} className={`checkout-step ${status}`}>
                  <span>{step}</span>
                  <div>
                    <strong>{label}</strong>
                    <small>
                      {step === 1 && 'Verifica artículos y tu celular.'}
                      {step === 2 && 'Haz el pago al QR o número oficial.'}
                      {step === 3 && 'Ingresa nombre y operación.'}
                      {step === 4 && 'El admin confirma y prepara tu pedido.'}
                    </small>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="checkout-card-grid">
            <section className="checkout-summary-card">
              <div className="checkout-card-header">
                <div>
                  <h2>Resumen del pedido</h2>
                  <p>{cart.length ? 'Ajusta cantidades antes de generar el pedido.' : 'Tu carrito está vacío.'}</p>
                </div>
                <Link className="text-link" to="/catalogo">Agregar productos</Link>
              </div>

              <div className="checkout-items-list">
                {cart.map(product => (
                  <article key={product.id} className="checkout-item-row">
                    <div className="checkout-item-icon">{product.imageUrl ? <img className="checkout-item-photo" src={product.imageUrl} alt="" /> : <div className="checkout-item-photo checkout-item-photo--placeholder">FG</div>}</div>
                    <div className="checkout-item-copy">
                      <h3>{product.name}</h3>
                      <p>{product.category || 'Producto de ferretería'}</p>
                      <small>{formatCurrency(product.price)} c/u</small>
                    </div>
                    <div className="checkout-item-controls">
                      <button disabled={!!order} onClick={() => changeQty(product.id, -1)}>−</button>
                      <strong>{product.qty}</strong>
                      <button disabled={!!order} onClick={() => changeQty(product.id, 1)}>+</button>
                    </div>
                    <div className="checkout-item-total">{formatCurrency(product.price * product.qty)}</div>
                    <button className="checkout-item-remove" disabled={!!order} onClick={() => removeItem(product.id)}>×</button>
                  </article>
                ))}
                {!cart.length && !order && (
                  <div className="empty-state compact">
                    <span>🛒</span>
                    <h3>Tu carrito está vacío</h3>
                    <p>Agrega productos del catálogo para generar el pedido.</p>
                    <Link className="btn btn-primary" to="/catalogo">Ver catálogo</Link>
                  </div>
                )}
              </div>

              <div className="checkout-help-panel">
                <h3>¿Cómo funciona?</h3>
                <ul>
                  <li>La web genera un código de pedido único.</li>
                  <li>El cliente yapea el monto exacto al número o QR oficial.</li>
                  <li>Luego reporta el nombre del pagador y el número de operación.</li>
                  <li>La ferretería valida el abono y continúa con el pedido.</li>
                </ul>
              </div>
            </section>

            <aside className="checkout-payment-card">
              <div className="checkout-payment-top">
                <span className="checkout-badge">Pedido {orderCode}</span>
                <h2>{formatCurrency(subtotal)}</h2>
                <p>{order ? 'Ya puedes realizar el abono usando Yape.' : 'Genera el pedido para continuar al pago.'}</p>
              </div>

              <div className="checkout-customer-card">
                <div>
                  <small>Cliente</small>
                  <strong>{user?.name}</strong>
                </div>
                <div>
                  <small>Correo</small>
                  <strong>{user?.email}</strong>
                </div>
                <div>
                  <small>Celular</small>
                  {phoneSaved ? <strong>{customerPhone}</strong> : <input type="tel" required pattern="[0-9]{9}" maxLength="9" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Ingresa tu celular" />}
                </div>
              </div>

              {!order ? (
                <div className="checkout-generate-box">
                  <h3>Antes de pagar</h3>
                  <p>
                    Al continuar, registraremos oficialmente tu pedido y bloquearemos el total a pagar para que la
                    ferretería pueda identificar el abono exacto.
                  </p>
                  <button className="btn btn-primary full" disabled={busy || !cart.length || (!phoneSaved && customerPhone.length !== 9)} onClick={createOrder}>
                    {busy ? 'Generando pedido…' : 'Continuar al pago'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="yape-payment-card">
                    <div className="yape-payment-title">
                      <span className="dot" />
                      <strong>Datos oficiales de Yape</strong>
                    </div>
                    <p>Realiza el abono por el importe exacto a nombre de:</p>
                    <div className="yape-identity-card">
                      <div>
                        <small>Titular</small>
                        <strong>{config.owner || 'Ferretería Guillermo'}</strong>
                      </div>
                      <div>
                        <small>Celular Yape</small>
                        <strong>{config.phone || 'No configurado'}</strong>
                      </div>
                    </div>
                    {config.qrUrl && <img className="yape-qr-large" src={config.qrUrl} alt="Código QR de Yape" />}
                    {!config.phone && !config.qrUrl && (
                      <div className="admin-error light">⚠ La ferretería todavía no configuró sus datos de Yape. No envíes dinero aún.</div>
                    )}
                  </div>

                  <form className="checkout-report-form" onSubmit={reportPayment}>
                    <h3>Confirma tu abono</h3>
                    <label>
                      Nombre que aparece en Yape
                      <input required maxLength="100" value={payer} onChange={e => setPayer(e.target.value)} placeholder="Ejemplo: Steven Saldaña M." />
                    </label>
                    <label>
                      Número de operación de Yape
                      <input required minLength="4" maxLength="100" pattern="[A-Za-z0-9-]{4,100}" value={reference} onChange={e => setReference(e.target.value)} placeholder="Código del movimiento" />
                    </label>
                    <div className="checkout-note-box">
                      <strong>Importante</strong>
                      <p>
                        Informar la operación no confirma el pago por sí solo. El administrador verificará el abono en su Yape antes de preparar el pedido.
                      </p>
                    </div>
                    <button className="btn btn-primary full" disabled={busy || (!config.phone && !config.qrUrl)}>
                      {busy ? 'Enviando a verificación…' : 'Ya yapeé · Enviar a verificación'}
                    </button>
                  </form>
                </>
              )}

              {error && <div className="admin-error light">⚠ {error}</div>}

              <div className="checkout-shortcuts">
                <Link className="back-home" to="/mis-pedidos">Ver mis pedidos</Link>
                <Link className="back-home" to="/catalogo">Volver al catálogo</Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
