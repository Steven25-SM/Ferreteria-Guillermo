import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, UserRound, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { useAuth } from './AuthContext';
import Brand from './Brand';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [orange, setOrange] = useState(false);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  useEffect(() => { setAccountOpen(false); setOpen(false); }, [pathname]);

  useEffect(() => {
    // El punto de transición sigue el contenido, incluso si cambia la altura
    // del hero o la anchura de la pantalla.
    const sectionId = pathname === '/' ? 'home-hero' : null;
    if (!sectionId) {
      setOrange(false);
      return;
    }

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const section = document.getElementById(sectionId);
        if (!section) {
          setOrange(false);
          return;
        }
        // Activa naranja cuando el extremo inferior del bloque ha cruzado el header.
        const headerHeight = document.querySelector('[data-site-header]')?.getBoundingClientRect().height || 86;
        setOrange(section.getBoundingClientRect().bottom <= headerHeight);
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pathname]);

  const catalogOrange = pathname === '/catalogo';
  const showOrange = orange || catalogOrange;
  const overHero = pathname === '/' && !orange;
  const lightText = showOrange || overHero;
  const ink = lightText ? 'text-white/90 hover:text-white' : 'text-slate-500 hover:text-teal';
  const activeLink = lightText ? 'text-white' : 'text-teal';

  return (
    <header
      data-site-header
      className={
        'sticky top-0 z-40 border-b transition-[background-color,color,border-color,box-shadow] duration-700 ease-in-out ' +
        (pathname === '/' ? '-mb-[86px] ' : '') +
        (showOrange ? 'bg-[#EA580C] border-transparent text-white shadow-[0_12px_24px_-5px_rgba(0,0,0,0.45),0_5px_10px_-3px_rgba(0,0,0,0.26)]' :
          overHero ? 'bg-black/20 border-white/40 text-white' :
          'bg-white/95 backdrop-blur border-b border-slate-100 text-ink')
      }
    >
      <div className="container-page h-[86px] flex items-center justify-between gap-5">
        <Link to="/" className="flex items-center min-w-fit shrink-0" aria-label="Ir al inicio">
          <Brand inverted={lightText} />
        </Link>

        <nav className={'hidden md:flex items-center gap-9 text-[13px] font-semibold transition-[background-color,color,border-color] duration-700 ease-in-out ' + ink}>
          <NavLink to="/" className={({ isActive }) => (isActive ? activeLink : ink)}>Inicio</NavLink>
          <NavLink to="/catalogo" className={({ isActive }) => (isActive ? activeLink : ink)}>Catálogo</NavLink>
          <a href="/#ventajas" className={ink}>Nosotros</a>
          <a href="/#contacto" className={ink}>Contacto</a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button type="button" aria-label="Abrir menú de cuenta" aria-expanded={accountOpen} onClick={() => setAccountOpen(v => !v)} className={'flex items-center gap-2 rounded-full p-1 transition hover:bg-white/15 ' + (lightText ? 'text-white' : 'text-slate-700')}>
                <span className={'grid h-9 w-9 place-items-center rounded-full border ' + (lightText ? 'bg-white/20 border-white/40' : 'bg-orange-50 border-orange-200 text-[#EA580C]')}><UserRound size={19}/></span>
                <ChevronDown size={15}/>
              </button>
              {accountOpen && <div className="absolute right-0 top-full mt-3 w-60 rounded-2xl border border-slate-100 bg-white p-2 text-slate-800 shadow-xl">
                <div className="border-b border-slate-100 px-3 py-2 mb-1"><p className="text-sm font-bold truncate">{user.name}</p><p className="text-xs text-slate-500 truncate">{user.email}</p></div>
                <Link to="/perfil" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm hover:bg-orange-50"><Settings size={17}/> Perfil</Link>
                
                <button type="button" onClick={() => { setAccountOpen(false); logout(); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50"><LogOut size={17}/> Cerrar sesión</button>
              </div>}
            </div>
          ) : (
            <Link to="/login" className={'text-[13px] font-semibold ' + (lightText ? 'text-white hover:text-orange-100' : 'hover:text-teal')}>Iniciar sesión</Link>
          )}
          <Link to="/carrito" className={lightText ? 'relative text-white hover:text-orange-100' : 'relative hover:text-teal'} title="Lista de consulta">
            <ShoppingBag size={19} />
          </Link>

        </div>

        <button
          onClick={() => setOpen(!open)}
          className={'md:hidden ' + (lightText ? 'text-white' : 'text-ink')}
          aria-label="Menú"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav
          className={'md:hidden p-6 border-t flex flex-col gap-5 text-sm font-semibold ' +
            (showOrange ? 'bg-[#EA580C] border-orange-500 text-white' : overHero ? 'bg-[#172333] border-white/15 text-white' : 'bg-white border-slate-100 text-ink')}
          onClick={() => setOpen(false)}
        >
          <Link to="/">Inicio</Link>
          <Link to="/catalogo">Catálogo</Link>
          {user ? <><Link to="/perfil">Perfil</Link><button className="text-left" onClick={logout}>Cerrar sesión</button></> : <Link to="/login">Iniciar sesión</Link>}
          <Link to="/carrito">Mi lista</Link>
        </nav>
      )}
    </header>
  );
}
