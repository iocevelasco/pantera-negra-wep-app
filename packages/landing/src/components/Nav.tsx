import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const APP_URL = 'https://pantera-negra-app.fly.dev';

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-[#2A2A2A]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo — text-based, red dot as hanko seal */}
        <a href="/" className="flex items-center gap-1.5">
          <span
            className="font-serif font-bold text-xl text-white tracking-tight"
            style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
          >
            Mat<span className="text-[#EF233C]">Flow</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
          <a href="#funciones" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">
            Funciones
          </a>
          <a href="#como-funciona" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">
            Cómo funciona
          </a>
          <a href="#precios" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">
            Precios
          </a>
          <a href={APP_URL} className="text-sm text-[#9CA3AF] hover:text-white transition-colors">
            Iniciar sesión
          </a>
          <a
            href={`${APP_URL}/register`}
            className="text-sm font-medium bg-[#EF233C] text-white px-4 py-2 hover:bg-[#C41E30] transition-colors"
            style={{ borderRadius: '2px' }}
          >
            Empieza Gratis
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0A0A0A] border-t border-[#2A2A2A] px-6 py-4 flex flex-col gap-4">
          <a href="#funciones" className="text-sm text-[#9CA3AF]" onClick={() => setOpen(false)}>Funciones</a>
          <a href="#como-funciona" className="text-sm text-[#9CA3AF]" onClick={() => setOpen(false)}>Cómo funciona</a>
          <a href="#precios" className="text-sm text-[#9CA3AF]" onClick={() => setOpen(false)}>Precios</a>
          <a href={APP_URL} className="text-sm text-[#9CA3AF]" onClick={() => setOpen(false)}>Iniciar sesión</a>
          <a
            href={`${APP_URL}/register`}
            className="text-sm font-medium bg-[#EF233C] text-white px-4 py-2.5 text-center"
            style={{ borderRadius: '2px' }}
          >
            Empieza Gratis
          </a>
        </div>
      )}
    </header>
  );
}
