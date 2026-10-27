import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowUpRight } from 'lucide-react';
export function ProductGrid({ products, showPrices = true }) { return <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-9">{products.map(p => <Link to={'/producto/' + p.id} key={p.id} className="group block min-w-0">
<div className="relative w-full aspect-square rounded-2xl bg-white overflow-hidden flex items-center justify-center border border-orange-50">{p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="absolute inset-0 block w-full h-full object-cover object-center group-hover:scale-[1.035] transition-transform duration-300"/> : <Package className="text-slate-300" size={45}/>}
</div>
<p className="text-[11px] text-slate-400 uppercase font-bold tracking-widest mt-4">{p.categoryName || 'Ferretería'}
</p>
<div className="mt-1 flex gap-2 justify-between items-start">
<h3 className="font-display font-extrabold text-sm md:text-base tracking-tight group-hover:text-teal break-words">{p.name}
</h3>
<ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 shrink-0"/>
</div>{showPrices && <p className="mt-2 text-teal font-bold">S/ {Number(p.price).toFixed(2)}
</p>}
</Link>)}
</div>; }
export function EmptyProducts({ title = 'Aún no tenemos productos registrados', description = 'Pronto encontrarás aquí el catálogo de Ferretería Guillermo.' }) { return <div className="border border-dashed border-slate-200 bg-white rounded-2xl p-12 flex flex-col items-center text-center gap-3">
<div className="rounded-full bg-slate-50 p-4">
<Package className="text-slate-400" size={28}/>
</div>
<h3 className="font-display font-extrabold text-xl">{title}
</h3>
<p className="text-sm text-slate-500 max-w-md">{description}
</p>
</div>; }
