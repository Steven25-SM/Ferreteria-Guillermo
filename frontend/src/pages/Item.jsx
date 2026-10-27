import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { trackInteraction } from '../lib/interactions';
import { useAuth } from '../components/AuthContext';
import { Package, ArrowLeft, ShoppingBag } from 'lucide-react';
export default function Item() { const { user } = useAuth(); const { id } = useParams(); const [p, setP] = useState(null); useEffect(() => { api.get('/products/' + id).then(r => { setP(r.data); if (user) trackInteraction('VIEW', Number(id)); }).catch(() => { }); }, [id, user]); const add = () => { const cart = JSON.parse(localStorage.getItem('fgcart') || '[]'); const existing = cart.find(x => x.id === p.id); if (existing)
    existing.quantity++;
else
    cart.push({ id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, quantity: 1 }); localStorage.setItem('fgcart', JSON.stringify(cart)); if (user) trackInteraction('CART_ADD', p.id); window.dispatchEvent(new Event('fg-cart')); alert('Producto agregado a tu lista'); }; return <div className="container-page py-14">
<Link className="inline-flex items-center gap-2 text-sm text-slate-500 mb-8" to="/catalogo">
<ArrowLeft size={16}/> Volver al catálogo</Link>{p ? <div className="grid md:grid-cols-2 gap-12">
<div className="picture-fallback rounded-3xl aspect-square grid place-items-center overflow-hidden">{p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="max-h-full object-contain"/> : <Package size={80} className="text-slate-300"/>}
</div>
<div>
<p className="text-teal text-xs font-bold uppercase tracking-widest">{p.categoryName}
</p>
<h1 className="font-display text-4xl font-extrabold mt-3">{p.name}
</h1>
<p className="text-3xl font-extrabold mt-6">S/ {Number(p.price).toFixed(2)}
</p>
<p className="mt-5 text-slate-500 leading-7">{p.description || 'Consulta disponibilidad directamente por WhatsApp.'}
</p>
<p className="mt-6 text-sm text-slate-500">{p.available ? 'Consulta disponibilidad por WhatsApp' : 'No disponible actualmente'}
</p>
<button className="btn mt-6 inline-flex items-center gap-2" disabled={!p.available} onClick={add}>
<ShoppingBag size={18}/> Agregar a mi lista</button>
</div>
</div> : <p>Producto no encontrado.</p>}
</div>; }
