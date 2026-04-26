export function Testimonial() {
  return (
    <section className="py-24 px-6 bg-[#FFFFFF] border-t border-b border-[#E5E5E3]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 items-center">
          {/* Label + academy info */}
          <div>
            <span className="section-label block mb-8">Academias que confían en MatFlow</span>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 bg-[#0A0A0A] flex items-center justify-center shrink-0"
                style={{ borderRadius: '2px' }}
              >
                <span
                  className="text-[#EF233C] font-serif font-bold text-lg"
                  style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
                >
                  PN
                </span>
              </div>
              <div>
                <p className="font-semibold text-[#0A0A0A] text-sm">Pantera Negra BJJ</p>
                <p className="text-xs text-[#6B7280]">Academia de Brazilian Jiu-Jitsu</p>
                <p className="text-xs text-[#6B7280]">São Paulo, Brasil</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <span className="inline-block w-2 h-2 rounded-full bg-[#EF233C]" aria-hidden="true" />
              <span className="text-xs font-mono text-[#6B7280]">BJJ — Primera academia en MatFlow</span>
            </div>
          </div>

          {/* Quote */}
          <blockquote className="relative">
            <div className="text-6xl text-[#E5E5E3] font-serif leading-none mb-4 select-none" aria-hidden="true">
              "
            </div>
            <p
              className="text-xl md:text-2xl font-serif text-[#0A0A0A] leading-relaxed"
              style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
            >
              Desde que usamos MatFlow, el registro de asistencia y el control de membresías es automático. Nos ahorra horas cada semana y tenemos visibilidad completa de nuestros alumnos.
            </p>
            <footer className="mt-6 flex items-center gap-3">
              <div className="w-8 h-px bg-[#EF233C]" aria-hidden="true" />
              <cite className="text-sm text-[#6B7280] not-italic font-mono">
                Pantera Negra BJJ — São Paulo
              </cite>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
