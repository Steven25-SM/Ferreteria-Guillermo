import React, { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { trackInteraction } from '../lib/interactions';
import { useAuth } from '../components/AuthContext';
import { ProductGrid, EmptyProducts } from '../components/ProductGrid';
export default function Catalog() { const { user } = useAuth(); const [params, setParams] = useSearchParams(); const [products, setProducts] = useState([]); const [categories, setCategories] = useState([]); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true); const category = params.get('categoria') || ''; useEffect(() => { Promise.all([api.get('/products'), api.get('/categories')]).then(([p, c]) => { setProducts(p.data); setCategories(c.data); }).catch(() => { }).finally(() => setLoading(false)); }, []); useEffect(() => { if (!user || search.trim().length < 2) return; const timer = setTimeout(() => trackInteraction('SEARCH', null, search.trim()), 900); return () => clearTimeout(timer); }, [search, user]); const visible = useMemo(() => products.filter(p => (!category || p.categoryName === category) && p.name.toLowerCase().includes(search.toLowerCase())), [category, search, products]); return <main>
<div className="container-page pt-10 pb-9">
<div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-5 justify-between">
<div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
<button onClick={() => setParams({})} className={'px-4 py-2 rounded-full text-xs font-bold ' + (!category ? 'bg-teal text-white' : 'bg-slate-100 text-slate-600')}>Todos</button>{categories.map(c => <button key={c.id} onClick={() => setParams({ categoria: c.name })} className={'px-4 py-2 rounded-full text-xs font-bold ' + (category === c.name ? 'bg-teal text-white' : 'bg-slate-100 text-slate-600')}>{c.name}
</button>)}
</div>
<label className="relative flex h-12 w-full lg:w-[275px] shrink-0 items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
<Search size={19} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
<input type="search" aria-label="Buscar productos" className="h-full w-full min-w-0 border-0 bg-transparent py-2 pr-4 pl-12 text-sm text-slate-800 outline-none placeholder:text-slate-400" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar productos..."/>
</label>
</div>
</div>
<div className="container-page pb-24">
<div className="border-b border-slate-100 pb-4 mb-7 flex justify-between items-center text-xs text-slate-500">
<span>{loading ? 'Cargando productos...' : `${visible.length} productos`}
</span>
<span className="inline-flex items-center gap-2">
<SlidersHorizontal size={16}/> Catálogo</span>
</div>{visible.length ? <ProductGrid products={visible}/> : <EmptyProducts title={search ? 'No encontramos coincidencias' : 'Aún no hay productos en el catálogo'} description={search ? 'Prueba con otro nombre o categoría.' : 'Los productos que registres en el panel administrativo aparecerán aquí automáticamente.'}/>}
</div>
</main>; }
