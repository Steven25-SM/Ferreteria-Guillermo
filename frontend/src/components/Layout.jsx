import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const CartIcon = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.2 12.3a2 2 0 0 0 2 1.7h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
export default function Layout() {
  const isHome = useLocation().pathname === '/'
  const { count } = useCart()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const signOut = async () => { await logout(); navigate('/') }
  if (isHome) return <Outlet />
  return <div className="fg-interior">
    <header className="fg-interior-header"><div className="fg-interior-wrap fg-interior-nav">
      <Link className="fg-interior-logo" to="/"><i/>FERRETERÍA GUILLERMO</Link>
      <button type="button" className="fg-mobile-menu" aria-label="Abrir navegación" aria-expanded={open} onClick={() => setOpen(!open)}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
      <nav className={open ? 'open' : ''}>
        <NavLink to="/" onClick={() => setOpen(false)}>Inicio</NavLink>
        <NavLink to="/catalogo" onClick={() => setOpen(false)}>Catálogo</NavLink>
        {user?.role === 'CUSTOMER' && <NavLink to="/mis-pedidos" onClick={() => setOpen(false)}>Mis pedidos</NavLink>}
        {user?.role === 'ADMIN' && <NavLink to="/admin" onClick={() => setOpen(false)}>Administración</NavLink>}
      </nav>
      <div className="fg-interior-actions">
        {user ? <button className="fg-interior-account" type="button" onClick={signOut}>Salir</button> : <Link className="fg-interior-account" to="/login">Ingresar</Link>}
        <Link className="fg-interior-cart" to="/carrito" aria-label={`Carrito con ${count} productos`}><CartIcon/><span>Carrito</span><b>{count}</b></Link>
      </div>
    </div></header>
    <div className="fg-interior-body"><Outlet /></div>
    <footer className="fg-interior-footer"><div className="fg-interior-wrap"><Link to="/">FERRETERÍA GUILLERMO</Link><div><span>Lunes a sábado · 8:00 a 19:00</span><small>© {new Date().getFullYear()} · Todos los derechos reservados</small></div></div></footer>
  </div>
}
