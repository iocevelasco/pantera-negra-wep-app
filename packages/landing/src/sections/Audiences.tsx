import { User, Building2, Check } from 'lucide-react';

const SINGLE = [
  'Panel de membresías completo',
  'Asistencia digital por clase',
  'Horario y capacidad de clases',
  'Registro de pagos y cobros',
  'Gestión de clases privadas',
  'Dashboard con alertas de alumnos en riesgo',
];

const NETWORK = [
  'Todo lo del dojo individual',
  'Múltiples academias desde un panel',
  'Soporte para diferentes artes marciales',
  'Sistemas de rango por disciplina (BJJ, Karate, MMA...)',
  'Estadísticas consolidadas de tu red',
  'Administrador independiente por dojo',
];

export function Audiences() {
  return (
    <section className="py-24 px-6 bg-[#F7F7F5]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <span className="section-label block mb-4">Para quién es MatFlow</span>
          <h2
            className="text-4xl md:text-5xl font-serif font-bold text-[#0A0A0A] leading-tight"
            style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
          >
            Un dojo o diez —
            <br />
            la plataforma crece contigo.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#E5E5E3]">
          {/* Single dojo */}
          <div className="bg-[#FFFFFF] p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-[#E5E5E3] flex items-center justify-center">
                <User size={18} strokeWidth={1.5} className="text-[#0A0A0A]" />
              </div>
              <div>
                <p className="font-mono text-xs text-[#EF233C] mb-0.5">Tipo A</p>
                <h3
                  className="font-serif font-semibold text-lg text-[#0A0A0A]"
                  style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
                >
                  Dueño de una academia
                </h3>
              </div>
            </div>
            <p className="text-[#6B7280] text-sm mb-8 leading-relaxed">
              Tienes un dojo y quieres dejar de usar hojas de cálculo. MatFlow te da control total desde el día uno.
            </p>
            <ul className="space-y-3">
              {SINGLE.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <Check size={14} className="text-[#EF233C] mt-0.5 shrink-0" strokeWidth={2.5} />
                  <span className="text-sm text-[#0A0A0A]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Network owner */}
          <div className="bg-[#0A0A0A] p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-[#2A2A2A] flex items-center justify-center">
                <Building2 size={18} strokeWidth={1.5} className="text-[#EF233C]" />
              </div>
              <div>
                <p className="font-mono text-xs text-[#EF233C] mb-0.5">Tipo B</p>
                <h3
                  className="font-serif font-semibold text-lg text-white"
                  style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
                >
                  Red de dojos
                </h3>
              </div>
            </div>
            <p className="text-[#9CA3AF] text-sm mb-8 leading-relaxed">
              Tienes múltiples academias, distintas artes marciales, o quieres escalar tu operación. MatFlow crece con vos.
            </p>
            <ul className="space-y-3">
              {NETWORK.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <Check size={14} className="text-[#EF233C] mt-0.5 shrink-0" strokeWidth={2.5} />
                  <span className="text-sm text-[#D1D5DB]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
