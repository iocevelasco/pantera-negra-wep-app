const PAINS = [
  { label: 'Hojas de cálculo', desc: 'para registrar la asistencia de cada clase' },
  { label: 'WhatsApp o efectivo', desc: 'para cobrar y recordar las membresías vencidas' },
  { label: 'Sin visibilidad', desc: 'de qué alumnos están activos y cuáles desaparecieron' },
  { label: 'Gestión manual', desc: 'de horarios, instructores y capacidad de clases' },
];

export function Problem() {
  return (
    <section className="py-24 px-6 bg-[#FFFFFF]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: copy */}
          <div>
            <span className="section-label block mb-6">El problema</span>
            <h2
              className="text-4xl md:text-5xl font-serif font-bold text-[#0A0A0A] leading-tight mb-6"
              style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
            >
              Administrar una academia no debería quitarte tiempo del tatami.
            </h2>
            <p className="text-[#6B7280] text-lg leading-relaxed">
              Eres instructor, no contador. Tu energía debe estar en tus alumnos,
              no en planillas, cobranzas manuales y mensajes de recordatorio.
            </p>
          </div>

          {/* Right: pain points */}
          <div className="space-y-0 border border-[#E5E5E3]">
            {PAINS.map((pain, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-6 border-b border-[#E5E5E3] last:border-b-0 hover:bg-[#F7F7F5] transition-colors"
              >
                <span className="text-[#EF233C] font-mono text-xs pt-0.5 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-medium text-[#0A0A0A] text-sm">{pain.label}</p>
                  <p className="text-[#6B7280] text-sm mt-0.5">{pain.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
