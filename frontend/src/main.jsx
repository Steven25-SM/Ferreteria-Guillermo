import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import Header from './components/Header';
import { AuthProvider } from './components/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './components/AdminAuthContext';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Item from './pages/Item';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import CustomerProfile from './pages/CustomerProfile';
function Protected({ children }) { const { admin, expired } = useAdminAuth(); return admin?.role === 'ADMIN' ? children : <Navigate to="/admin/login" replace state={expired ? { sessionExpired: true } : undefined}/>; }
function App() { const location = useLocation(); const adminArea = location.pathname.startsWith('/admin'); return <><>{!adminArea && <><Header /><FloatingWhatsApp /></>}</>
<Routes>
<Route path="/" element={<Home />}/>
<Route path="/catalogo" element={<Catalog />}/>
<Route path="/producto/:id" element={<Item />}/>
<Route path="/carrito" element={<Cart />}/>
<Route path="/mis-pedidos" element={<Navigate to="/carrito" replace />}/>
<Route path="/perfil" element={<CustomerProfile />}/>
<Route path="/login" element={<Auth />}/>
<Route path="/registro" element={<Auth register/>}/>
<Route path="/admin/login" element={<Auth admin/>}/>
<Route path="/admin/*" element={<Protected>
<Admin />
</Protected>}/>
<Route path="*" element={<Navigate to="/"/>}/>
</Routes></>; }
createRoot(document.getElementById('root')).render(<React.StrictMode>
<BrowserRouter>
<AuthProvider>
<AdminAuthProvider>
<App />
</AdminAuthProvider>
</AuthProvider>
</BrowserRouter>
</React.StrictMode>);
