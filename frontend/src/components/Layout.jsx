import { Link, NavLink, Outlet } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

export default function Layout() {
  const { count } = useCart()
  const [open, setOpen] = useState(false)

  const nav = [
    ['/', 'Inicio'],
    ['/catalogo', 'Catálogo'],
    ['/cotizacion', 'Cotización'],
    ['/pagos', 'Pagos'],
    ['/admin', 'Administración'],
  ]

  return (
    <>
      <header className="header">
        <div className="container nav">
          <Link className="brand" to="/">Ferretería <b>Guillermo</b></Link>
          <button className="menu-toggle" onClick={() => setOpen(!open)}>☰</button>
          <nav className={open ? 'open' : ''}>
            {nav.map(([to, label]) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)}
                className={({isActive}) => isActive ? 'active' : ''}>
                {label}
              </NavLink>
            ))}
          </nav>
          <Link className="cart-button" to="/cotizacion">🛒 <span>{count}</span></Link>
        </div>
      </header>
      <Outlet />
    </>
  )
}
