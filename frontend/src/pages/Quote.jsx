import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'

export default function Quote() {
  const {
    cart,
    total,
    changeQty,
    removeItem,
    clearCart
  } = useCart()

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    message: ''
  })

  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [quoteId, setQuoteId] = useState(null)

  const submit = async e => {
    e.preventDefault()

    console.log('SUBMIT EJECUTADO')
    console.log('Carrito:', cart)
    console.log('Formulario:', form)

    setError('')

    if (!cart.length) {
      setError('No hay productos en la cotización.')
      return
    }

    if (!form.clientName.trim()) {
      setError('Ingresa tu nombre completo.')
      return
    }

    if (!form.clientEmail.trim()) {
      setError('Ingresa tu correo electrónico.')
      return
    }

    if (!form.clientPhone.trim()) {
      setError('Ingresa tu teléfono.')
      return
    }

    setSending(true)

    try {
      console.log('Enviando POST a /quotes...')

      const response = await api.post('/quotes', {
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone,
        message: form.message,
        items: cart.map(p => ({
          productId: p.id,
          quantity: p.qty
        }))
      })

      console.log('Respuesta del backend:', response.data)

      setQuoteId(response.data.id)

      clearCart()

      setForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        message: ''
      })

      setSent(true)

    } catch (err) {
      console.error('ERROR AL ENVIAR:', err)
      console.error('RESPUESTA DEL BACKEND:', err.response?.data)

      setError(
        err.response?.data?.message ||
        'No pudimos enviar tu solicitud. Revisa que el servidor esté funcionando.'
      )

    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <main>

        {/* HERO */}

        <section className="page-hero">
          <div className="container">

            <span className="eyebrow">
              SOLICITUD
            </span>

            <h1>
              Prepara tu cotización
            </h1>

            <p>
              Revisa los productos seleccionados y completa tus datos.
            </p>

          </div>
        </section>


        {/* CONTENIDO */}

        <section className="section container">

          {/* ERROR */}

          {error && (
            <div className="notice">

              <strong>
                ⚠ No se pudo enviar la solicitud.
              </strong>

              <p>
                {error}
              </p>

            </div>
          )}


          <div className="quote-layout">

            {/* PRODUCTOS */}

            <div>

              {cart.length ? (

                cart.map(p => (

                  <div
                    className="quote-item"
                    key={p.id}
                  >

                    <div className="quote-item-icon">
                      {p.icon}
                    </div>


                    <div className="quote-item-info">

                      <h3>
                        {p.name}
                      </h3>

                      <p>
                        {p.category} · S/ {Number(p.price).toFixed(2)} c/u
                      </p>

                    </div>


                    {/* CANTIDAD */}

                    <div className="qty-controls">

                      <button
                        type="button"
                        onClick={() => changeQty(p.id, -1)}
                      >
                        −
                      </button>

                      <b>
                        {p.qty}
                      </b>

                      <button
                        type="button"
                        onClick={() => changeQty(p.id, 1)}
                      >
                        +
                      </button>

                    </div>


                    {/* SUBTOTAL */}

                    <strong>
                      S/ {(Number(p.price) * p.qty).toFixed(2)}
                    </strong>


                    {/* ELIMINAR */}

                    <button
                      type="button"
                      className="remove"
                      onClick={() => removeItem(p.id)}
                    >
                      ✕
                    </button>

                  </div>

                ))

              ) : (

                <div className="empty-state">

                  <span>
                    🛒
                  </span>

                  <h3>
                    Aún no agregaste productos
                  </h3>

                  <p>
                    Visita el catálogo y agrega los productos que necesitas.
                  </p>

                  <Link
                    className="btn btn-primary"
                    to="/catalogo"
                  >
                    Ir al catálogo
                  </Link>

                </div>

              )}

            </div>


            {/* FORMULARIO */}

            <form
              className="form-card"
              onSubmit={submit}
              noValidate
            >

              <h2>
                Datos del cliente
              </h2>

              <p className="muted">
                La información será usada para preparar la solicitud.
              </p>


              {/* NOMBRE */}

              <label>

                Nombre completo

                <input
                  type="text"
                  required
                  value={form.clientName}
                  onChange={e =>
                    setForm({
                      ...form,
                      clientName: e.target.value
                    })
                  }
                />

              </label>


              {/* EMAIL */}

              <label>

                Correo electrónico

                <input
                  type="email"
                  required
                  value={form.clientEmail}
                  onChange={e =>
                    setForm({
                      ...form,
                      clientEmail: e.target.value
                    })
                  }
                />

              </label>


              {/* TELEFONO */}

              <label>

                Teléfono

                <input
                  type="tel"
                  required
                  value={form.clientPhone}
                  onChange={e =>
                    setForm({
                      ...form,
                      clientPhone: e.target.value
                    })
                  }
                />

              </label>


              {/* MENSAJE */}

              <label>

                Mensaje

                <textarea
                  rows="4"
                  value={form.message}
                  onChange={e =>
                    setForm({
                      ...form,
                      message: e.target.value
                    })
                  }
                  placeholder="Indica alguna característica, cantidad o consulta."
                />

              </label>


              {/* TOTAL */}

              <div className="summary">

                <span>
                  Total referencial
                </span>

                <strong>
                  S/ {total.toFixed(2)}
                </strong>

              </div>


              {/* BOTON */}

              <button
                className="btn btn-primary full"
                type="submit"
                disabled={sending}
              >

                {sending
                  ? 'Enviando solicitud...'
                  : 'Enviar solicitud de cotización'}

              </button>

            </form>

          </div>

        </section>

      </main>


      {/* MODAL DE ÉXITO */}

      {sent && (

        <div className="modal-overlay">

          <div className="success-modal">

            <div className="success-icon">
              ✓
            </div>


            <h2>
              ¡Solicitud enviada!
            </h2>


            <p>
              Hemos recibido correctamente tu solicitud de cotización.
            </p>


            <p>
              Te enviamos una confirmación al correo que registraste.
            </p>


            {quoteId && (

              <div className="quote-number">
                Solicitud #{quoteId}
              </div>

            )}


            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setSent(false)}
            >
              Aceptar
            </button>

          </div>

        </div>

      )}

    </>
  )
}