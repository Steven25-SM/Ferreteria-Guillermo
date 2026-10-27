import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// Fotografías de referencia. Para una versión final, sustituir por fotografías propias
// optimizadas dentro de /public/banners/ (y actualizar estas rutas).
const slides = [
  {
    eyebrow: 'FERRETERÍA GUILLERMO',
    title: 'Todo para construir tus mejores proyectos.',
    description: 'Herramientas, materiales y accesorios para tus ideas. Descubre lo que tenemos para ti.',
    button: 'Ver catálogo',
    href: '/catalogo',
    image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=2000&q=85',
  },
  {
    eyebrow: 'PINTURAS EN SPRAY',
    title: 'Dale un nuevo acabado a tus proyectos.',
    description: 'Descubre nuestras pinturas en spray para trabajos y acabados.',
    button: 'Ver pinturas',
    href: '/catalogo?categoria=Pinturas',
    image: 'https://media.koelnmesse.io/iem/redaktionell/eisenwarenmesse/img/die_messe/angebotsbereiche/bau-und-heimwerkerbedarf_t01_719.jpg',
  },
  {
    eyebrow: 'ELECTRICIDAD',
    title: 'Conecta tus proyectos con soluciones confiables.',
    description: 'Explora interruptores, tomacorrientes y accesorios eléctricos.',
    button: 'Ver electricidad',
    href: '/catalogo?categoria=Electricidad',
    image: 'https://storage.googleapis.com/ibo-static-images-prod/store/sarjapur/12.jpg',
  },
  {
    eyebrow: 'SEGURIDAD',
    title: 'Protege lo que más importa.',
    description: 'Conoce nuestra selección de cerraduras y productos para el cuidado de tus espacios.',
    button: 'Explorar seguridad',
    href: '/catalogo?categoria=Seguridad',
    image: 'https://images.unsplash.com/photo-1609154375277-4ec8580068c0?auto=format&fit=crop&w=2000&q=85',
  },
  {
    eyebrow: 'ATENCIÓN EN TIENDA',
    title: 'Encuentra fácil. Consulta por WhatsApp.',
    description: 'Arma tu lista desde la web y consulta disponibilidad por WhatsApp.',
    button: 'Ver catálogo',
    href: '/catalogo',
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=2000&q=85',
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive(index => (index + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [manual]);

  const move = change => {
    setActive(index => (index + change + slides.length) % slides.length);
    setManual(value => value + 1);
  };

  return (
    <section
      id="home-hero"
      aria-label="Destacados de Ferretería Guillermo"
      className="relative isolate flex min-h-[680px] md:min-h-[740px] items-center overflow-hidden bg-[#1b2b36] text-white"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.title}
          className={'absolute inset-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none ' +
            (index === active ? 'opacity-100' : 'opacity-0')}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${slide.image}")` }}
          />
        </div>
      ))}
      {/* Sombra uniforme: la foto ocupa TODO el ancho, sin desvanecerse a la izquierda. */}
      <div className="absolute inset-0 bg-[#101b25]/38 pointer-events-none" />

      <div className="container-page relative z-10 w-full pt-36 pb-36 md:pt-44 md:pb-32">
        <div key={active} className="max-w-[760px] hero-enter">
          <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold tracking-[.16em] text-white backdrop-blur-sm">
            {slides[active].eyebrow}
          </span>
          <h1 className="font-display mt-7 max-w-[740px] text-[39px] font-extrabold leading-[1.08] tracking-[-.055em] sm:text-[58px] lg:text-[70px]">
            {slides[active].title}
          </h1>
          <p className="mt-6 max-w-[540px] text-base leading-relaxed text-white/90 md:text-lg">
            {slides[active].description}
          </p>
          <Link
            to={slides[active].href}
            className="mt-9 inline-flex items-center gap-3 rounded-xl bg-[#EA580C] px-7 py-4 font-bold text-white transition-colors hover:bg-[#C2410C]"
          >
            {slides[active].button} <ArrowRight size={19} />
          </Link>
        </div>
      </div>

      {/* Controles laterales discretos, sin botones ni indicadores inferiores. */}
      <button
        type="button"
        onClick={() => move(-1)}
        aria-label="Banner anterior"
        className="absolute bottom-8 left-4 z-20 grid h-12 w-12 place-items-center rounded-full border border-white/45 bg-black/15 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/25 hover:border-white focus-visible:outline-2 focus-visible:outline-white md:bottom-auto md:left-5"
      >
        <ChevronLeft size={27} strokeWidth={1.6} />
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        aria-label="Banner siguiente"
        className="absolute bottom-8 right-4 z-20 grid h-12 w-12 place-items-center rounded-full border border-white/45 bg-black/15 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/25 hover:border-white focus-visible:outline-2 focus-visible:outline-white md:bottom-auto md:right-5"
      >
        <ChevronRight size={27} strokeWidth={1.6} />
      </button>
    </section>
  );
}
