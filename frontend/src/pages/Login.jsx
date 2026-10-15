import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login({admin=false}) {
  const { user, login, logout } = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [show,setShow]=useState(false); const [error,setError]=useState(''); const [sending,setSending]=useState(false)
  if(user && (admin ? user.role==='ADMIN' : user.role==='CUSTOMER')) return <Navigate to={admin?"/admin":"/"} replace />
  const submit=async e=>{e.preventDefault();setError('');setSending(true);try{const result=await login(email.trim(),password);if(admin && result.role!=='ADMIN'){await logout();throw new Error('Este acceso es exclusivo de administración.')}if(!admin && result.role!=='CUSTOMER'){await logout();throw new Error('Los administradores ingresan desde /admin.')}navigate(location.state?.from?.pathname || (admin?'/admin':'/'),{replace:true})}catch(err){setError(err.response?.data?.message || err.message || 'No se pudo iniciar sesión.')}finally{setSending(false)}}
  return <main className="login-page">
    <section className="login-shell">
      <div className="login-brand-panel">
        <div className="login-mark">FG</div><span className="eyebrow">FERRETERÍA GUILLERMO</span>
        <h1>Tu ferretería,<br/><span>siempre contigo.</span></h1>
        <p>Compra herramientas y materiales de forma segura. Revisa tus pedidos y descubre productos recomendados.</p>
        <div className="login-benefits"><span>✓ Catálogo de productos</span><span>✓ Historial de pedidos</span><span>✓ Sesión protegida</span></div>
      </div>
      <form className="login-card" onSubmit={submit}>
        <div className="login-icon">FG</div><h2>Bienvenido</h2><p>{admin?"Ingresa tus credenciales de administrador.":"Accede a tu cuenta para comprar."}</p>
        {error && <div className="form-error">⚠ {error}</div>}
        <label>Correo electrónico<input type="email" autoComplete="username" placeholder="correo@ejemplo.com" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
        <label>Contraseña<div className="password-field"><input type={show?'text':'password'} autoComplete="current-password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required/><button type="button" onClick={()=>setShow(!show)}>{show?'Ocultar':'Ver'}</button></div></label>
        <button className="btn btn-primary full login-submit" disabled={sending}>{sending?'Ingresando…':(admin?"Ingresar al panel →":"Iniciar sesión →")}</button>
        {!admin&&<a className="back-home" href="/registro">Crear cuenta nueva</a>}<a className="back-home" href="/">← Volver a la tienda</a>
      </form>
    </section>
  </main>
}
