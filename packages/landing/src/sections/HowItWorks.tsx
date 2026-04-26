const STEPS = [
  {
    num: '01',
    title: 'Crea tu academia',
    desc: 'Registra tu dojo en minutos. Nombre, arte marcial, y listo. Sin configuración compleja ni formularios interminables.',
  },
  {
    num: '02',
    title: 'Agrega tus alumnos',
    desc: 'Carga tu listado de alumnos. Asigna membresías, planes y cinturones. El sistema lleva el registro de quién está activo.',
  },
  {
    num: '03',
    title: 'Gestiona el día a día',
    desc: 'Asistencia, pagos y clases. Todo desde tu teléfono o computadora. El dashboard te muestra exactamente qué necesitas atender.',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 px-6 bg-[#FFFFFF]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <span className="section-label block mb-4">Cómo funciona</span>
          <h2
            className="text-4xl md:text-5xl font-serif font-bold text-[#0A0A0A] leading-tight"
            style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
          >
            En marcha en menos
            <br />
            de diez minutos.
          </h2>
        </div>

        {/* Steps — horizontal line connecting them */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div
            className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-[#E5E5E3]"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative flex flex-col gap-6">
                {/* Number circle */}
                <div className="flex items-center gap-4 lg:flex-col lg:items-start">
                  <div className="relative z-10 w-16 h-16 border-2 border-[#E5E5E3] bg-[#FFFFFF] flex items-center justify-center shrink-0">
                    <span
                      className="font-serif font-bold text-xl text-[#EF233C]"
                      style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
                    >
                      {i + 1}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="font-mono text-xs text-[#EF233C] mb-2">{step.num}</p>
                  <h3
                    className="font-serif font-semibold text-xl text-[#0A0A0A] mb-3"
                    style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
