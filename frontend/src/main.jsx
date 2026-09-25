import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { CartProvider } from './context/CartContext'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Quote from './pages/Quote'
import Payments from './pages/Payments'
import Admin from './pages/Admin'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/cotizacion" element={<Quote />} />
            <Route path="/pagos" element={<Payments />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
)
