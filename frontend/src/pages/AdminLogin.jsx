import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const { user, login, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  if (loading) return <main className="admin-auth-page"><div className="admin-auth-wait">Verificando acceso…</div></main>
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />

  async function submit(event) {
    event.preventDefault()
    if (pending) return
    setError('')
    setPending(true)
    try {
      const account = await login(email.trim(), password)
      if (account.role !== 'ADMIN') {
        await logout()
        throw new Error('Esta sección es exclusiva para administradores.')
      }
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudo iniciar sesión. Revisa tus credenciales.')
    } finally {
      setPending(false)
    }
  }

  return <main className="admin-auth-page">
    <div className="admin-auth-box">
      <header className="admin-auth-heading">
        <div className="admin-auth-logo" aria-hidden="true">FG</div>
        <div className="admin-auth-business">FERRETERÍA GUILLERMO <span>Panel interno</span></div>
      </header>
      <div className="admin-auth-body">
        <span className="admin-auth-kicker">ACCESO RESTRINGIDO</span>
        <h1>Administración</h1>
        <p>Ingresa para gestionar productos, pagos y pedidos.</p>
        {error && <div className="admin-auth-error" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <label htmlFor="admin-email">Correo administrativo</label>
          <input id="admin-email" type="email" autoComplete="username" placeholder="admin@ferreteriaguillermo.pe" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          <label htmlFor="admin-password">Contraseña</label>
          <div className="admin-auth-password">
            <input id="admin-password" type={visible ? 'text' : 'password'} autoComplete="current-password" placeholder="Introduce tu contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{visible ? 'Ocultar' : 'Ver'}</button>
          </div>
          <button className="admin-auth-submit" type="submit" disabled={pending}>{pending ? 'Verificando…' : 'Ingresar al panel →'}</button>
        </form>
        <a className="admin-auth-return" href="/">← Volver a la tienda</a>
      </div>
      <footer className="admin-auth-footer">Solo personal autorizado</footer>
    </div>
  </main>
}
