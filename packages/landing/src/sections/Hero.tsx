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

        {/* App preview placeholder */}
        <div className="mt-16 border border-[#2A2A2A] bg-[#111111] aspect-[16/9] max-w-4xl flex items-center justify-center" style={{ borderRadius: '2px' }}>
          <div className="text-center p-8">
            <div className="w-12 h-12 bg-[#1A1A1A] border border-[#2A2A2A] mx-auto mb-4 flex items-center justify-center" style={{ borderRadius: '2px' }}>
              <span className="text-[#EF233C] font-mono text-xs">MF</span>
            </div>
            <p className="text-[#6B7280] text-sm font-mono">[ Screenshot de la plataforma ]</p>
            <p className="text-[#4B5563] text-xs mt-1 font-mono">Panel de membresías — MatFlow</p>
          </div>
        </div>
      </div>
    </section>
  );
}
