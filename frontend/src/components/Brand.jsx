import React from 'react';

/** Versión horizontal del logotipo: emblema original + letras legibles. */
export default function Brand({ admin = false, inverted = false }) {
  return (
    <span className="inline-flex items-center gap-2.5 shrink-0" aria-label="Ferretería Guillermo">
      <img
        src="/logo-emblema.png"
        alt=""
        aria-hidden="true"
        className="w-[73px] h-[51px] object-contain shrink-0"
      />
      <span className="flex flex-col leading-none min-w-0">
        <span className={"font-display font-black text-[15px] tracking-[-.035em] whitespace-nowrap transition-colors duration-300 " + (inverted ? "text-white" : "text-[#233345]")}>
          FERRETERÍA
        </span>
        <span className={"brand-script text-[24px] leading-[1.05] whitespace-nowrap transition-colors duration-300 " + (inverted ? "text-orange-100" : "text-[#A65B2D]")}>
          Guillermo
        </span>
        {admin && (
          <span className={"text-[9px] mt-1.5 uppercase tracking-[.15em] font-bold " + (inverted ? "text-white/80" : "text-slate-500")}>
            Administración
          </span>
        )}
      </span>
    </span>
  );
}
