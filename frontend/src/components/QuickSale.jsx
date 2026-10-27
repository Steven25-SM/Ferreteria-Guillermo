import React, { useMemo, useState } from 'react';
import { Search, Plus, Minus, Trash2, ArrowLeft, ArrowRight, CheckCircle2, ShoppingBasket } from 'lucide-react';

const soles = n => `S/ ${Number(n || 0).toFixed(2)}`;
const paymentOptions = [['CASH', 'Efectivo'], ['YAPE', 'Yape'], ['PLIN', 'Plin']];
const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export default function QuickSale({ products, working, onSave }) {
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState('');
  const [lines, setLines] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [saving, setSaving] = useState(false);
  // Mostrar también productos agotados para que el admin sepa que existen y pueda reponerlos.
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const found = products.filter(p => {
    if (p.active === false) return false;
    const haystack = normalize(`${p.name} ${p.sku || ''} ${p.categoryName || ''}`);
    return terms.every(term => haystack.includes(term));
  }).sort((a, b) => {
    const byStock = Number(Number(b.stock) > 0) - Number(Number(a.stock) > 0);
    return byStock || String(a.name).localeCompare(String(b.name), 'es');
  }).slice(0, 30);
  const selected = useMemo(() => Object.entries(lines).map(([id, quantity]) => ({ product: products.find(p => String(p.id) === id), quantity })).filter(x => x.product && x.quantity > 0), [lines, products]);
  const total = selected.reduce((sum, { product, quantity }) => sum + Number(product.price) * quantity, 0);
  function change(id, delta) {
    const product = products.find(p => String(p.id) === String(id));
    if (!product) return;
    setLines(previous => {
      const next = { ...previous };
      const quantity = Math.max(0, Math.min(Number(product.stock), (next[id] || 0) + delta));
      if (quantity) next[id] = quantity; else delete next[id];
      return next;
    });
  }
  async function confirm() {
    if (!selected.length || working || saving) return;
    setSaving(true);
    try {
      // onSave returns true only on success; no clearing if server rejects the sale.
      const ok = await onSave({ items: selected.map(({ product, quantity }) => ({ productId: product.id, quantity })), paymentMethod });
      if (ok) { setLines({}); setQuery(''); setPaymentMethod('CASH'); setStep(1); }
    } finally { setSaving(false); }
  }
  return <div className="max-w-4xl space-y-5">
    <div className="flex items-center gap-3 text-sm font-semibold"><span className={`rounded-full px-3 py-1.5 ${step === 1 ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700'}`}>1. Productos</span><ArrowRight size={16} className="text-slate-400"/><span className={`rounded-full px-3 py-1.5 ${step === 2 ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'}`}>2. Pago</span></div>
    {step === 1 ? <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-lg font-extrabold mb-1">Agregar productos</h2><p className="text-slate-500 text-sm mb-4">Busca por nombre o código. Puedes agregar varios productos.</p>
        <div className="relative"><Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input className="input w-full" style={{ paddingLeft: 46 }} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar interruptor, chapa, cinta..."/></div>
        <div className="mt-4 max-h-[450px] overflow-auto divide-y divide-slate-100">{found.map(p => <div key={p.id} className="py-3 flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-slate-50 overflow-hidden shrink-0">{p.imageUrl && <img src={p.imageUrl} alt="" className="w-full h-full object-contain"/>}</div><div className="min-w-0 flex-1"><div className="text-sm font-semibold leading-tight">{p.name}</div><div className="text-xs text-slate-500 mt-1">{soles(p.price)} · {Number(p.stock) > 0 ? `${p.stock} disponibles` : 'Sin stock — repón en Inventario'}</div></div><button type="button" aria-label={`Agregar ${p.name}`} onClick={() => change(p.id, 1)} disabled={Number(p.stock) <= 0 || (lines[p.id] || 0) >= p.stock} className="h-9 w-9 rounded-xl bg-orange-600 text-white grid place-items-center disabled:opacity-40"><Plus size={19}/></button></div>)}{!found.length && <p className="py-6 text-sm text-slate-500">{products.length === 0 ? 'No se cargaron productos. Comprueba la conexión con el backend y vuelve a abrir Inventario.' : 'No encontramos productos que coincidan con esa búsqueda.'}</p>}</div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col"><h2 className="font-display text-lg font-extrabold mb-1">Esta venta</h2><p className="text-slate-500 text-sm mb-4">{selected.length} producto(s) distintos</p><div className="flex-1 space-y-3">{selected.map(({ product, quantity }) => <div key={product.id} className="border-b border-slate-100 pb-3"><div className="font-semibold text-sm">{product.name}</div><div className="flex items-center justify-between mt-2"><div className="inline-flex items-center gap-2"><button type="button" className="border rounded-lg p-1.5" onClick={() => change(product.id, -1)} aria-label="Restar"><Minus size={15}/></button><span className="w-6 text-center font-bold">{quantity}</span><button type="button" className="border rounded-lg p-1.5 disabled:opacity-40" onClick={() => change(product.id, 1)} disabled={quantity >= product.stock} aria-label="Sumar"><Plus size={15}/></button><button type="button" className="p-1.5 text-red-500" onClick={() => setLines(previous => { const next = {...previous}; delete next[product.id]; return next; })} aria-label="Quitar"><Trash2 size={16}/></button></div><b>{soles(quantity * Number(product.price))}</b></div></div>)}{!selected.length && <div className="py-12 text-center text-slate-400"><ShoppingBasket className="mx-auto mb-2"/>Agrega un producto para comenzar.</div>}</div><div className="border-t pt-4 mt-5 flex justify-between text-lg font-extrabold"><span>Total</span><span>{soles(total)}</span></div><button type="button" disabled={!selected.length} onClick={() => setStep(2)} className="btn mt-4 w-full inline-flex items-center justify-center gap-2 disabled:opacity-40">Siguiente <ArrowRight size={18}/></button></section>
    </div> : <section className="rounded-2xl border border-slate-200 bg-white p-6 max-w-xl"><h2 className="font-display text-xl font-extrabold">¿Cómo pagó el cliente?</h2><p className="text-sm text-slate-500 mt-1 mb-5">Confirma que recibiste el pago antes de registrar la venta.</p><div className="grid grid-cols-3 gap-2">{paymentOptions.map(([value,label]) => <button key={value} type="button" onClick={() => setPaymentMethod(value)} className={`rounded-xl border-2 py-4 text-sm font-bold ${paymentMethod === value ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600'}`}>{label}</button>)}</div><div className="mt-6 border-t pt-5 flex items-center justify-between"><span className="font-bold">Total a cobrar</span><span className="font-display text-2xl font-extrabold">{soles(total)}</span></div><p className="text-xs text-slate-500 mt-3">Se descontará stock únicamente al confirmar la venta.</p><div className="mt-6 flex flex-col sm:flex-row gap-3"><button type="button" className="border rounded-xl px-5 py-3 font-semibold flex items-center justify-center gap-2" onClick={() => setStep(1)} disabled={saving || working}><ArrowLeft size={17}/> Volver</button><button type="button" className="btn flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50" disabled={saving || working} onClick={confirm}><CheckCircle2 size={18}/>{saving || working ? 'Registrando...' : 'Registrar venta'}</button></div></section>}
  </div>;
}
