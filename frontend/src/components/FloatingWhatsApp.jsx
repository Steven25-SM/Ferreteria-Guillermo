import React, { useState } from 'react';
import { openWhatsApp, whatsappReady } from '../lib/whatsapp';
export default function FloatingWhatsApp() {
  const [notice, setNotice] = useState(false);
  return <div className="fixed bottom-6 right-6 z-50 group flex items-center gap-3" role="complementary" aria-label="Contacto por WhatsApp">
    {notice && <span className="absolute bottom-full right-0 mb-3 max-w-[240px] rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">Configura el número de WhatsApp para habilitar el contacto.</span>}
    <span className="pointer-events-none translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300 rounded-xl bg-white px-4 py-2 font-semibold text-sm text-slate-800 shadow-lg border border-slate-100 whitespace-nowrap">Consultas y pedidos</span>
    <button type="button" aria-label="Consultas y pedidos por WhatsApp" title="Consultas y pedidos" className="h-[54px] w-[54px] sm:h-[58px] sm:w-[58px] rounded-full drop-shadow-[0_7px_14px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:scale-110 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-green-500" onClick={()=> { if (!openWhatsApp()) setNotice(true); }}>
      <img src="/whatsapp-logo-optimizado.webp" alt="WhatsApp" className="w-full h-full object-contain" />
    </button>
  </div>;
}
