import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Boxes, ShoppingBasket, ClipboardList, BarChart3, Settings, Package, Plus, Search, Camera, ArrowDownToLine, ArrowUpFromLine, ScanLine, AlertTriangle, Menu, X, LogOut, Trash2, Edit3 } from 'lucide-react';
import { api, getError } from '../lib/api';
import { adminApi } from '../lib/adminApi';
import { useAdminAuth } from '../components/AdminAuthContext';
import Brand from '../components/Brand';
import QuickSale from '../components/QuickSale';
const menu = [['Resumen', LayoutDashboard], ['Inventario', Boxes], ['Registrar venta', ShoppingBasket], ['Pedidos', ClipboardList]];
const blank = { name: '', sku: '', description: '', price: '', categoryId: '', imageUrl: '', initialStock: '0', minimumStock: '5' };
function money(n) { return 'S/ ' + Number(n || 0).toFixed(2); }
export default function Admin() { const [tab, setTab] = useState('Inventario'); const [products, setProducts] = useState([]); const [categories, setCategories] = useState([]); const [orders, setOrders] = useState([]); const [search, setSearch] = useState(''); const [modal, setModal] = useState(false); const [editing, setEditing] = useState(null); const [form, setForm] = useState(blank); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [menuOpen, setMenuOpen] = useState(false); const [working, setWorking] = useState(false); const [adjust, setAdjust] = useState(null); const [qty, setQty] = useState('1'); const [sale, setSale] = useState({ productId: '', quantity: '1', paymentMethod: 'CASH' }); const [photo, setPhoto] = useState(null); const [photoResults, setPhotoResults] = useState([]); const { admin: user, logoutAdmin: logout } = useAdminAuth(); const navigate = useNavigate(); async function load() { try {
    const [p, c, o] = await Promise.all([adminApi.get('/admin/products'), api.get('/categories'), adminApi.get('/admin/orders')]);
    setProducts(p.data);
    setCategories(c.data);
    setOrders(o.data);
}
catch (e) {
    setError(getError(e));
} } useEffect(() => { load(); }, []); const shown = useMemo(() => products.filter(p => (p.name + ' ' + p.sku).toLowerCase().includes(search.toLowerCase())), [products, search]); const low = products.filter(p => p.stock <= p.minimumStock); async function act(fn, success) { setWorking(true); setError(''); setMessage(''); try {
    await fn();
    setMessage(success);
    await load();
    setModal(false);
    setAdjust(null);
    return true;
}
catch (e) {
    setError(getError(e));
    return false;
}
finally {
    setWorking(false);
} } function openNew() { setEditing(null); setForm(blank); setModal(true); } function openEdit(p) { setEditing(p.id); setForm({ ...blank, ...p, categoryId: p.categoryId || '', initialStock: 0 }); setModal(true); } async function submit(e) { e.preventDefault(); await act(() => editing ? adminApi.put('/admin/products/' + editing, form) : adminApi.post('/admin/products', form), editing ? 'Producto actualizado' : 'Producto creado'); } const set = (field, value) => setForm(f => ({ ...f, [field]: value })); function close() { setModal(false); setAdjust(null); } function onPhoto(e) { const file = e.target.files?.[0]; if (!file)
    return; setPhoto(URL.createObjectURL(file)); setPhotoResults([]); setMessage('Foto seleccionada. La identificación automática con IA se habilitará en la siguiente fase; por ahora busca por nombre o SKU.'); } const Sidebar = () => <aside className={'bg-[#EA580C] text-white border-r border-orange-600 w-[260px] shrink-0 flex-col h-[100dvh] overflow-y-auto overscroll-contain ' + (menuOpen ? 'flex fixed inset-y-0 left-0 z-50 shadow-xl' : 'hidden lg:flex')}>
<Link to="/" className="min-h-[108px] flex items-center px-5" aria-label="Ir a la tienda">
<Brand admin inverted />
</Link>
<div className="px-4 mt-5 space-y-1">{menu.map(([label, Icon]) => <button key={label} onClick={() => { setTab(label); setMenuOpen(false); setError(''); setMessage(''); }} className={'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-[13px] font-semibold ' + (tab === label ? 'bg-white text-[#C2410C] shadow-sm' : 'text-white/90 hover:bg-white/15 hover:text-white')}>
<Icon size={17}/>{label}
</button>)}
</div>
<div className="mx-4 mt-6 border-t border-white/25 pt-5 space-y-2">
<Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold text-white/90 hover:bg-white/15 hover:text-white transition-colors">
<ArrowUpFromLine size={17}/> Volver a la tienda
</Link>
<button onClick={async () => { await logout(); navigate('/admin/login'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold text-white/90 hover:bg-white/15 hover:text-white transition-colors">
<LogOut size={17}/> Cerrar sesión
</button>
</div>
</aside>; return <div className="h-[100dvh] flex overflow-hidden bg-white text-ink">
<Sidebar />
<div className="flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-contain bg-white">
<header className="h-[96px] bg-white border-b border-slate-100 flex items-center justify-between px-5 md:px-9">
<button className="lg:hidden" onClick={() => setMenuOpen(true)}>
<Menu />
</button>
<div className="hidden lg:block text-sm text-slate-400">Panel de control <span className="mx-2">/</span> <b className="text-ink">{tab}
</b>
</div>
<div className="ml-auto flex items-center gap-3">
<span className="text-xs text-slate-500 hidden sm:inline">{user?.name}
</span>
<div className="w-9 h-9 grid place-items-center rounded-full bg-[#fff0e5] font-bold text-teal">{user?.name?.[0] || 'A'}
</div>
</div>
</header>
<main className="px-5 md:px-9 py-10 max-w-[1520px] mx-auto">
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">
<div>
<p className="text-[11px] text-teal uppercase font-extrabold tracking-[.16em]">FERRETERÍA GUILLERMO</p>
<h1 className="font-display text-3xl font-extrabold tracking-tight mt-2">{tab}
</h1>
<p className="text-slate-400 text-sm mt-2">{tab === 'Inventario' ? 'Controla tus productos y mantén el stock actualizado.' : tab === 'Registrar venta' ? 'Vende varios productos sin formularios complicados.' : tab === 'Pedidos' ? 'Revisa pedidos hechos desde la web.' : 'Información real de la ferretería.'}
</p>
</div>{tab === 'Inventario' && <button onClick={openNew} className="btn inline-flex items-center justify-center gap-2">
<Plus size={17}/> Agregar producto</button>}
</div>{error && <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl mb-6">{error}
</div>}{message && <div className="bg-teal/10 text-teal text-sm p-4 rounded-xl mb-6">{message}
</div>}{(tab === 'Resumen' || tab === 'Inventario') && <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">{[[Package, 'Productos', products.length], [Boxes, 'Unidades en stock', products.reduce((s, p) => s + p.stock, 0)], [AlertTriangle, 'Stock bajo', low.length], [ClipboardList, 'Pedidos pendientes', orders.filter(o => o.status === 'PENDING').length]].map(([Icon, label, value]) => <div key={label} className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6">
<div className="flex justify-between">
<span className="text-slate-500 text-xs font-semibold">{label}
</span>
<Icon size={18} className="text-teal"/>
</div>
<p className="font-display text-3xl font-extrabold mt-4">{value}
</p>
</div>)}
</div>}{tab === 'Inventario' && <>
<div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
<div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<div>
<h2 className="font-display text-lg font-extrabold">Productos del inventario <span className="text-slate-400 text-xs font-normal ml-1">({shown.length} productos)</span>
</h2>
<p className="text-slate-400 text-xs mt-1">Información sincronizada con PostgreSQL</p>
</div>
<label className="relative">
<Search size={16} className="text-slate-400 absolute top-[13px] left-3"/>
<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o SKU" className="input pl-9 text-xs sm:w-64"/>
</label>
</div>
<div className="overflow-auto">
<table className="data-table w-full whitespace-nowrap">
<thead className="bg-[#fafbfc]">
<tr>{['Producto', 'Categoría', 'SKU', 'Stock', 'Precio', 'Estado', 'Acciones'].map(h => <th key={h}>{h}
</th>)}
</tr>
</thead>
<tbody>{shown.map(p => <tr key={p.id}>
<td>
<div className="flex items-center gap-3">
<div className="w-11 h-11 picture-fallback rounded-lg grid place-items-center overflow-hidden">{p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-contain"/> : <Package size={18} className="text-slate-300"/>}
</div>
<b className="max-w-[190px] truncate">{p.name}
</b>
</div>
</td>
<td>{p.categoryName}
</td>
<td className="text-slate-500">{p.sku}
</td>
<td className="font-bold">{p.stock}
</td>
<td>{money(p.price)}
</td>
<td>
<span className={'rounded-full px-2.5 py-1 text-[10px] font-bold ' + (p.stock === 0 ? 'bg-red-50 text-red-600' : p.stock <= p.minimumStock ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-700')}>{p.stock === 0 ? 'Agotado' : p.stock <= p.minimumStock ? 'Stock bajo' : 'Disponible'}
</span>
</td>
<td>
<div className="flex gap-3">
<button title="Editar" className="text-slate-500 hover:text-teal" onClick={() => openEdit(p)}>
<Edit3 size={17}/>
</button>
<button className="text-teal font-bold" onClick={() => { setQty('1'); setAdjust(p); }}>Stock</button>
<button className="text-red-400" title="Desactivar" onClick={() => { if (window.confirm('¿Desactivar ' + p.name + '?'))
    act(() => adminApi.delete('/admin/products/' + p.id), 'Producto desactivado'); }}>
<Trash2 size={17}/>
</button>
</div>
</td>
</tr>)}
</tbody>
</table>
</div>{!shown.length && <div className="text-center p-16">
<Package size={40} className="mx-auto text-slate-300"/>
<h3 className="text-lg font-bold mt-4">Aún no hay productos</h3>
<p className="text-sm text-slate-400 mt-2">Comienza agregando el primer artículo de tu ferretería.</p>
<button onClick={openNew} className="btn mt-5">Agregar producto</button>
</div>}
</div>
<div className="mt-6 bg-white rounded-2xl border border-slate-100 p-6">
<h3 className="font-display font-extrabold flex items-center gap-2">
<Camera size={19} className="text-teal"/> Consulta por fotografía <span className="ml-auto text-[10px] rounded-full bg-amber-50 text-amber-700 px-3 py-1">Próximamente: IA</span>
</h3>
<p className="text-sm text-slate-500 my-3">Ya puedes seleccionar o tomar una foto desde el móvil. La identificación con IA se incorporará posteriormente; actualmente consulta por nombre o SKU.</p>
<label className="btn-light inline-flex items-center gap-2">
<Camera size={17}/> Tomar o subir foto<input type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto}/>
</label>{photo && <img src={photo} alt="Foto tomada" className="rounded-lg mt-4 max-h-40"/>}
</div></>}{tab === 'Resumen' && <div className="bg-white rounded-2xl p-8 border border-slate-100">
<h2 className="font-display text-lg font-extrabold">Bienvenido al nuevo panel</h2>
<p className="text-sm text-slate-500 mt-3">Empieza registrando los artículos reales en Inventario. Luego podrás registrar ventas de mostrador y revisar pedidos de la web.</p>
<button onClick={() => setTab('Inventario')} className="btn mt-6">Ir al inventario</button>
</div>}{tab === 'Registrar venta' && <QuickSale products={products} working={working} onSave={(payload) => act(() => adminApi.post('/admin/sales',payload), 'Venta registrada y stock actualizado')} />}{tab === 'Pedidos' && <div className="bg-white rounded-2xl border border-slate-100 overflow-auto">
<table className="data-table w-full">
<thead>
<tr>{['Pedido', 'Cliente', 'Estado', 'Pago', 'Total', 'Acciones'].map(h => <th key={h}>{h}
</th>)}
</tr>
</thead>
<tbody>{orders.map(o => <tr key={o.id}>
<td>#{o.id}
</td>
<td>{o.customerEmail}
</td>
<td>{o.status}
</td>
<td>{o.paymentMethod} / {o.paymentStatus}
</td>
<td>{money(o.total)}
</td>
<td>{o.status === 'PENDING' && <button className="text-teal font-bold" onClick={() => act(() => adminApi.post('/admin/orders/' + o.id + '/complete'), 'Pedido completado')}>Confirmar entrega y pago</button>}{o.status === 'PENDING' && <button className="text-red-500 font-bold ml-4" onClick={() => act(() => adminApi.post('/admin/orders/' + o.id + '/cancel'), 'Pedido cancelado')}>Cancelar</button>}
</td>
</tr>)}
</tbody>
</table>{!orders.length && <div className="p-16 text-slate-400 text-sm text-center">Todavía no hay pedidos.</div>}
</div>}
</main>
</div>{(modal || adjust) && <div className="fixed z-50 inset-0 bg-slate-900/50 grid place-items-center p-4" onMouseDown={e => { if (e.target === e.currentTarget)
    close(); }}>
<div className="bg-white rounded-2xl max-w-lg w-full p-7 max-h-[90vh] overflow-auto">
<div className="flex items-center justify-between">
<h2 className="font-display text-xl font-extrabold">{adjust ? 'Actualizar stock' : editing ? 'Editar producto' : 'Agregar producto'}
</h2>
<button onClick={close}>
<X size={20}/>
</button>
</div>{adjust ? <div className="mt-6">
<p className="font-bold">{adjust.name}
</p>
<p className="text-sm text-slate-500 mt-1">Stock actual: {adjust.stock}
</p>
<label className="block mt-5 text-xs font-bold">Cantidad de unidades<input className="input mt-2" type="number" min="1" value={qty} onChange={e => setQty(e.target.value)}/>
</label>
<div className="flex gap-3 mt-6">
<button disabled={working} className="btn flex-1" onClick={() => act(() => adminApi.post('/admin/inventory/movements', { productId: adjust.id, type: 'IN', quantity: Number(qty), reason: 'Ingreso de mercadería' }), 'Stock ingresado')}>+ Entrada</button>
<button disabled={working} className="btn-light flex-1" onClick={() => act(() => adminApi.post('/admin/inventory/movements', { productId: adjust.id, type: 'OUT', quantity: Number(qty), reason: 'Ajuste por salida' }), 'Stock retirado')}>− Salida</button>
</div>
</div> : <form onSubmit={submit} className="mt-6 grid grid-cols-2 gap-4">
<label className="col-span-2 text-xs font-bold">Nombre del producto<input required className="input mt-2" value={form.name} onChange={e => set('name', e.target.value)}/>
</label>
<label className="text-xs font-bold">SKU / código<input required className="input mt-2" value={form.sku} onChange={e => set('sku', e.target.value)}/>
</label>
<label className="text-xs font-bold">Categoría<select required className="input mt-2" value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
<option value="">Selecciona</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}
</option>)}
</select>
</label>
<label className="text-xs font-bold">Precio (S/)<input required type="number" min="0" step="0.01" className="input mt-2" value={form.price} onChange={e => set('price', e.target.value)}/>
</label>
<label className="text-xs font-bold">Stock mínimo<input required type="number" min="0" className="input mt-2" value={form.minimumStock} onChange={e => set('minimumStock', e.target.value)}/>
</label>{!editing && <label className="col-span-2 text-xs font-bold">Stock inicial<input required type="number" min="0" className="input mt-2" value={form.initialStock} onChange={e => set('initialStock', e.target.value)}/>
</label>}
<label className="col-span-2 text-xs font-bold">URL de imagen (o ruta /images/...)<input className="input mt-2" value={form.imageUrl || ''} onChange={e => set('imageUrl', e.target.value)}/>
</label>
<label className="col-span-2 text-xs font-bold">Descripción<textarea className="input mt-2 min-h-20" value={form.description || ''} onChange={e => set('description', e.target.value)}/>
</label>
<button disabled={working} className="btn col-span-2">{working ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
</button>
</form>}
</div>
</div>}
</div>; }
