const APP_URL = 'https://pantera-negra-app.fly.dev';

export function Hero() {
  return (
    <section className="bg-[#0A0A0A] pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Subtle Japanese grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto relative">
        <div className="max-w-3xl">
          {/* Label */}
          <div className="flex items-center gap-3 mb-8">
            <span className="section-label text-[#6B7280]">Para academias de artes marciales</span>
            <span className="inline-block w-12 h-px bg-[#EF233C]" />
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-serif font-bold text-white leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
          >
            Gestiona tu dojo.
            <br />
            <span className="text-[#EF233C]">Enfócate</span> en el tatami.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#9CA3AF] leading-relaxed mb-10 max-w-2xl">
            MatFlow es la plataforma gratuita para academias de artes marciales.
            Membresías, asistencia, clases y pagos — todo en un solo lugar,
            sin costo.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a
              href={`${APP_URL}/register-dojo`}
              className="inline-flex items-center gap-2 bg-[#EF233C] text-white font-medium px-6 py-3.5 text-base hover:bg-[#C41E30] transition-colors"
              style={{ borderRadius: '2px' }}
            >
              Empieza Gratis
              <span aria-hidden="true">→</span>
            </a>
            <span className="text-sm text-[#6B7280] font-mono">
              Sin tarjeta de crédito · Sin límites
            </span>
          </div>
        </div>

        {/* App screenshots — real dashboard */}
        <div className="mt-16 max-w-4xl relative">
          {/* Main screenshot */}
          <div className="border border-[#2A2A2A] overflow-hidden shadow-2xl" style={{ borderRadius: '4px' }}>
            <div className="bg-[#1A1A1A] px-4 py-2.5 flex items-center gap-2 border-b border-[#2A2A2A]">
              <span className="w-3 h-3 rounded-full bg-[#EF233C] opacity-70" />
              <span className="w-3 h-3 rounded-full bg-[#F59E0B] opacity-70" />
              <span className="w-3 h-3 rounded-full bg-[#22C55E] opacity-70" />
              <span className="ml-3 text-xs text-[#4B5563] font-mono">pantera-negra-app.fly.dev</span>
            </div>
            <img
              src="/screenshot-dashboard.png"
              alt="Panel de membresías de Pantera Negra BJJ en MatFlow"
              className="w-full block"
              loading="eager"
            />
          </div>

          {/* Floating panel screenshot */}
          <div
            className="absolute -bottom-6 -right-6 w-64 border border-[#2A2A2A] overflow-hidden shadow-2xl hidden lg:block"
            style={{ borderRadius: '4px' }}
          >
            <div className="bg-[#1A1A1A] px-3 py-1.5 flex items-center gap-1.5 border-b border-[#2A2A2A]">
              <span className="w-2 h-2 rounded-full bg-[#EF233C] opacity-70" />
              <span className="text-[10px] text-[#4B5563] font-mono">Dashboard</span>
            </div>
            <img
              src="/screenshot-panel.png"
              alt="Estadísticas del dashboard de MatFlow"
              className="w-full block"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
