const APP_URL = 'https://pantera-negra-app.fly.dev';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#1A1A1A] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-8 items-start">
          {/* Brand */}
          <div>
            <span
              className="font-serif font-bold text-lg text-white"
              style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
            >
              Mat<span className="text-[#EF233C]">Flow</span>
            </span>
            <p className="text-xs text-[#6B7280] mt-2 max-w-[160px] leading-relaxed">
              Gestión gratuita para academias de artes marciales.
            </p>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap gap-x-8 gap-y-2 sm:justify-center" aria-label="Footer">
            <a href="#funciones" className="text-xs text-[#6B7280] hover:text-white transition-colors">Funciones</a>
            <a href="#como-funciona" className="text-xs text-[#6B7280] hover:text-white transition-colors">Cómo funciona</a>
            <a href="#precios" className="text-xs text-[#6B7280] hover:text-white transition-colors">Precios</a>
            <a href={APP_URL} className="text-xs text-[#6B7280] hover:text-white transition-colors">Iniciar sesión</a>
            <a href={`${APP_URL}/register-dojo`} className="text-xs text-[#EF233C] hover:text-white transition-colors">Registro gratuito</a>
          </nav>

          {/* Legal */}
          <div className="text-right">
            <p className="text-xs text-[#6B7280] font-mono">© {year} MatFlow</p>
            <p className="text-xs text-[#4B5563] mt-1 font-mono">Hecho para el tatami</p>
            <p className="text-xs text-[#4B5563] mt-2 font-mono">
              Desarrollado por{' '}
              <span className="text-[#6B7280]">Ioce Velasco</span>
            </p>
          </div>
        </div>

        {/* Bottom divider + copyright full */}
        <div className="mt-8 pt-6 border-t border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#4B5563] font-mono">
            © {year} MatFlow. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[#4B5563] font-mono">
            Diseñado y desarrollado por{' '}
            <span className="text-[#6B7280] hover:text-[#EF233C] transition-colors cursor-default">
              Ioce Velasco
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
