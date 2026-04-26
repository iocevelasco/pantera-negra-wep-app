export function FinalCTA() {
  return (
    <section className="bg-[#0A0A0A] py-28 px-6 relative overflow-hidden">
      {/* Japanese grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto relative text-center">
        {/* Hanko seal motif */}
        <div className="flex items-center justify-center gap-3 mb-8" aria-hidden="true">
          <div className="w-16 h-px bg-[#2A2A2A]" />
          <div className="w-3 h-3 border border-[#EF233C] rotate-45" />
          <div className="w-16 h-px bg-[#2A2A2A]" />
        </div>

        <h2
          className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-6"
          style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
        >
          Tu academia,
          <br />
          organizada desde hoy.
        </h2>

        <p className="text-[#9CA3AF] text-lg mb-10 max-w-md mx-auto">
          Gratis. Sin tarjeta. En menos de diez minutos.
        </p>

        <a
          href="https://pantera-negra-app.fly.dev/register-dojo"
          className="inline-flex items-center gap-2 bg-[#EF233C] text-white font-medium px-8 py-4 text-base hover:bg-[#C41E30] transition-colors"
          style={{ borderRadius: '2px' }}
        >
          Empieza Gratis
          <span aria-hidden="true">→</span>
        </a>

        <p className="text-[#6B7280] text-xs font-mono mt-4">
          Sin tarjeta de crédito · Sin límites · Siempre gratuito
        </p>
      </div>
    </section>
  );
}
