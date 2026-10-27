import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, X, Minus, Plus, MessageCircle } from 'lucide-react';
import { trackInteraction } from '../lib/interactions';
import { useAuth } from '../components/AuthContext';
import { openWhatsApp, whatsappReady } from '../lib/whatsapp';

function loadCart() {
  try { const value = JSON.parse(localStorage.getItem('fgcart') || '[]'); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
export default function Cart() {
  const [cart, setCart] = useState(loadCart);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);
  function save(next) {
    if (user) cart.filter(item => !next.some(x => x.id === item.id)).forEach(item => trackInteraction('CART_REMOVE', item.id));
    setCart(next); localStorage.setItem('fgcart', JSON.stringify(next)); window.dispatchEvent(new Event('fg-cart'));
  }
  function changeQuantity(id, delta) {
    save(cart.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  }
  function send() {
    if (!openWhatsApp(cart)) {
      setMessage('Falta configurar el número de WhatsApp de la ferretería en frontend/.env.');
      return;
    }
    // Señal de intención, NO una compra: el usuario todavía debe enviar el mensaje en WhatsApp.
    // Mantener los perfiles ligados a la cuenta autenticada.
    if (user) cart.forEach(item => trackInteraction('WHATSAPP_INTENT', item.id));
    setMessage('Se abrió WhatsApp con tu lista. Envíala allí para consultar disponibilidad. No se ha registrado ningún pedido ni reserva.');
  }
  return <main className="container-page py-16 max-w-5xl min-h-[65vh]">
    <p className="text-xs tracking-[.2em] font-bold text-[#EA580C]">CONSULTAS Y PEDIDOS</p>
    <h1 className="font-display text-4xl font-extrabold mt-3">Tu lista de productos</h1>
    <p className="text-slate-500 mt-3">Elige cantidades y envía tu lista por WhatsApp. La tienda confirmará disponibilidad y detalles directamente contigo.</p>
    {message && <p role="status" className="mt-5 rounded-xl bg-orange-50 p-4 text-sm text-orange-900">{message}</p>}
    {!cart.length ? <div className="py-20 text-center"><Package size={42} className="mx-auto text-slate-300"/><h2 className="text-xl font-bold mt-4">Tu lista está vacía</h2><Link className="btn inline-block mt-6" to="/catalogo">Explorar catálogo</Link></div> : <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-3">{cart.map(item => <div key={item.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 p-4">
        <div className="w-20 h-20 rounded-xl picture-fallback overflow-hidden shrink-0">{item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-contain"/>}</div>
        <div className="min-w-[140px] flex-1"><p className="font-bold">{item.name}</p><p className="text-sm text-slate-500">S/ {Number(item.price).toFixed(2)} por unidad</p></div>
        <div className="flex items-center gap-3"><button type="button" aria-label={'Restar una unidad de '+item.name} onClick={()=>changeQuantity(item.id,-1)} className="rounded-full border p-2 hover:bg-orange-50"><Minus size={15}/></button><span className="font-bold tabular-nums">{item.quantity}</span><button type="button" aria-label={'Agregar una unidad de '+item.name} onClick={()=>changeQuantity(item.id,1)} className="rounded-full border p-2 hover:bg-orange-50"><Plus size={15}/></button></div>
        <button type="button" aria-label={'Quitar '+item.name} className="text-slate-500 hover:text-red-500" onClick={()=>save(cart.filter(x=>x.id!==item.id))}><X size={19}/></button>
      </div>)}</div>
      <aside className="h-fit rounded-2xl border border-slate-200 p-6 space-y-5"><h2 className="font-display text-xl font-bold">Resumen de consulta</h2><p className="text-sm text-slate-500">{cart.reduce((n,p)=>n+p.quantity,0)} unidades · {cart.length} productos distintos</p><p className="flex justify-between font-bold text-xl">Total referencial <span>S/ {total.toFixed(2)}</span></p><p className="text-xs text-slate-500">Precios y disponibilidad por confirmar. Enviar esta lista no realiza una compra ni reserva existencias.</p><button type="button" onClick={send} className="btn w-full flex items-center justify-center gap-2"><MessageCircle size={19}/> Enviar consulta por WhatsApp</button>{!whatsappReady && <p className="text-xs text-amber-700">El número de WhatsApp aún no está configurado.</p>}</aside>
    </div>}
  </main>;
}
