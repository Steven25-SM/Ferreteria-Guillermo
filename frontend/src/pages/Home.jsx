import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MapPin, PackageCheck, ShieldCheck, Truck, Phone, Lightbulb, Hammer, Wrench, Paintbrush, PlugZap } from 'lucide-react';
import { api } from '../lib/api';
import { ProductGrid, EmptyProducts } from '../components/ProductGrid';
import { useAuth } from '../components/AuthContext';
import HeroCarousel from '../components/HeroCarousel';
// Fotografías AMBIENTALES por categoría, nunca fotografías individuales de productos.
// Puedes reemplazarlas por imágenes propias en public/images/categories/.
const categoryPhotos = {
  Electricidad: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1100&q=85',
  Pinturas: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1100&q=85',
  Seguridad: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1100&q=85',
  Herramientas: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1100&q=85',
  Construcción: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1100&q=85',
  Plomería: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1100&q=85',
  Otros: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1100&q=85',
};
const categoryPalette = ['#e8e4d1','#f3c7b8','#ead0b8','#d8ded0'];
function CategoryShowcase(){
  const [categories,setCategories]=useState([]);
  const [offset,setOffset]=useState(0);
  const [hovering,setHovering]=useState(false);
  const [interacted,setInteracted]=useState(false);
  useEffect(()=>{let live=true;api.get('/categories').then(r=>{if(live)setCategories(r.data||[])}).catch(()=>{});return()=>{live=false}},[]);
  const count=categories.length;
  const rotate=(direction)=>{if(count>4)setOffset(v=>(v+direction+count)%count);setInteracted(true)};
  useEffect(()=>{if(count<=4||hovering)return;const timer=window.setInterval(()=>setOffset(v=>(v+1)%count),6500);return()=>window.clearInterval(timer)},[count,hovering]);
  const visible=count?Array.from({length:Math.min(4,count)},(_,i)=>categories[(offset+i)%count]):[];
  return <section className="container-page py-20 md:py-24" aria-label="Categorías de productos" onMouseEnter={()=>setHovering(true)} onMouseLeave={()=>setHovering(false)}>
    <h2 className="font-display font-extrabold text-3xl md:text-[42px] text-center tracking-tight mb-10">¿Qué estás buscando hoy?</h2>
    <div className="relative">
      <div key={offset} className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7 animate-[fadeIn_.65s_ease-out]">
      {visible.map((c,i)=><Link key={c.id} to={'/catalogo?categoria='+encodeURIComponent(c.name)} className="group text-center">
        <div className="relative aspect-square overflow-hidden rounded-2xl transition-transform duration-300 group-hover:-translate-y-1" style={{backgroundColor:categoryPalette[i%4]}}>
          {categoryPhotos[c.name]?<img src={categoryPhotos[c.name]} alt={'Ambiente de '+c.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />:<div className="absolute inset-0 bg-gradient-to-br from-[#e6c7af] to-[#bdb4a7]" />}
        </div>
        <h3 className="mt-5 font-display font-semibold uppercase text-xs sm:text-sm tracking-wide text-slate-800 group-hover:text-[#EA580C]">{c.name}</h3>
      </Link>)}
      </div>
      {count>4&&<>
        <button type="button" aria-label="Categorías anteriores" onClick={()=>rotate(-1)} className="absolute left-1 top-[33%] z-10 flex h-11 w-11 -translate-x-1/3 items-center justify-center rounded-full border border-white/60 bg-[#192632]/45 text-white backdrop-blur-sm transition hover:bg-[#192632]/70 md:-translate-x-1/2"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
        <button type="button" aria-label="Categorías siguientes" onClick={()=>rotate(1)} className="absolute right-1 top-[33%] z-10 flex h-11 w-11 translate-x-1/3 items-center justify-center rounded-full border border-white/60 bg-[#192632]/45 text-white backdrop-blur-sm transition hover:bg-[#192632]/70 md:translate-x-1/2"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
      </>}
    </div>
    <div className="mt-7 text-center"><Link to="/catalogo" className="text-[#EA580C] text-sm font-bold inline-flex items-center gap-2">Ver todas las categorías <ArrowRight size={16}/></Link></div>
  </section>
}
export default function Home() { const { user } = useAuth(); const [featured, setFeatured] = useState([]); useEffect(() => { api.get(user ? '/products/recommended' : '/products/best-sellers').then(r => setFeatured((r.data || []).slice(0, 4))).catch(() => setFeatured([])); }, [user]); return <>
<HeroCarousel />
<CategoryShowcase />
<section className="bg-[#fffaf5] py-20">
<div className="container-page">
<div className="flex justify-between items-end mb-9">
<div>
<span className="text-[11px] uppercase tracking-[.23em] text-teal font-extrabold">SELECCIÓN PARA TI</span>
<h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">{user ? 'Recomendados para ti' : 'Más vendidos'}
</h2>
</div>
<Link to="/catalogo" className="text-teal text-sm font-bold flex items-center gap-2">Ver todo <ArrowRight size={15}/>
</Link>
</div>{featured.length ? <ProductGrid products={featured}/> : <EmptyProducts title={user ? 'Estamos preparando tus recomendaciones' : 'Todavía no hay productos más vendidos'} description={user ? 'Explora productos o busca lo que necesitas para descubrir sugerencias relacionadas con tus intereses.' : 'Esta sección se llenará automáticamente cuando se registren ventas completadas.'}/>}
</div>
</section>
<section id="ventajas" className="container-page py-20">
<div className="grid md:grid-cols-3 gap-6">{[[PackageCheck, 'Consulta sin complicaciones', 'Elige lo que necesitas y envía tu lista por WhatsApp para consultar disponibilidad.'], [ShieldCheck, 'Atención cercana', 'Te ayudamos a encontrar el producto adecuado para tus proyectos.'], [Lightbulb, 'Lo que realmente necesitas', 'Herramientas y materiales para el hogar, obra y mantenimiento.']].map(([Icon, title, desc]) => <div key={title} className="rounded-2xl border p-7 border-slate-100">
<Icon size={31} className="text-teal"/>
<h3 className="mt-5 font-display font-extrabold text-lg">{title}
</h3>
<p className="mt-3 text-sm text-slate-500 leading-6">{desc}
</p>
</div>)}
</div>
</section>
<section id="contacto" className="bg-[#152a32] text-white py-16">
<div className="container-page flex flex-col md:flex-row justify-between gap-8">
<div>
<span className="text-orange-300 uppercase tracking-widest text-xs font-bold">FERRETERÍA GUILLERMO</span>
<h2 className="font-display text-3xl font-extrabold mt-3">Estamos para ayudarte.</h2>
<p className="text-slate-300 text-sm mt-3">Visítanos y consulta la disponibilidad de tus productos favoritos.</p>
</div>
<div className="space-y-3 text-sm">
<p className="flex gap-3 items-center">
<MapPin size={18}/> Dirección del local: por configurar</p>
<p className="flex gap-3 items-center">
<Phone size={18}/> Número de contacto: por configurar</p>
</div>
</div>
</section>
<footer className="bg-[#102229] text-slate-400 text-xs py-5">
<div className="container-page">© {new Date().getFullYear()} Ferretería Guillermo · Hecho para servir mejor.</div>
</footer></>; }
