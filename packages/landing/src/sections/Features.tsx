import { CreditCard, CheckSquare, Calendar, DollarSign, Users, Building2 } from 'lucide-react';

const FEATURES = [
  {
    num: '01',
    icon: CreditCard,
    title: 'Membresías bajo control',
    desc: 'Registra, cobra y renueva membresías sin papeles. Sabes en segundos quién está al día y quién no. Adultos, niños, planes mensuales o anuales.',
    highlight: true,
  },
  {
    num: '02',
    icon: CheckSquare,
    title: 'Asistencia digital',
    desc: 'Check-in en clase desde el celular. Lleva el historial completo de cada alumno sin planillas. Identifica quién está en riesgo de abandonar.',
    highlight: true,
  },
  {
    num: '03',
    icon: Calendar,
    title: 'Horario de clases',
    desc: 'Organiza tu agenda de clases, capacidad y instructores desde un panel simple. Gi, No-Gi, Kids — cada clase con su configuración.',
  },
  {
    num: '04',
    icon: DollarSign,
    title: 'Pagos y finanzas',
    desc: 'Registra cada pago, tipo (efectivo, transferencia, tarjeta) y genera reportes en segundos. Visión clara de tus ingresos mensuales.',
  },
  {
    num: '05',
    icon: Users,
    title: 'Clases privadas',
    desc: 'Gestiona alumnos de clase particular con sus planes, sesiones disponibles y asistencia por separado. Pensado para instructores.',
  },
  {
    num: '06',
    icon: Building2,
    title: 'Red de dojos',
    desc: '¿Tienes más de una academia o diferentes artes marciales? Gestiona todas desde un único panel. BJJ, Karate, MMA — en un solo lugar.',
  },
];

export function Features() {
  return (
    <section id="funciones" className="py-24 px-6 bg-[#F7F7F5]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-16">
          <div>
            <span className="section-label block mb-4">Funciones</span>
            <h2
              className="text-4xl md:text-5xl font-serif font-bold text-[#0A0A0A] leading-tight"
              style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
            >
              Todo lo que necesita
              <br />
              tu academia.
            </h2>
          </div>
          <p className="text-[#6B7280] max-w-xs text-sm leading-relaxed">
            Nada que no necesitas. Sin funciones bloqueadas por plan — todo disponible desde el primer día.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E5E5E3]">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.num}
                className={`p-8 flex flex-col gap-4 ${f.highlight ? 'bg-[#0A0A0A]' : 'bg-[#FFFFFF]'} hover:bg-[${f.highlight ? '#1A1A1A' : '#F7F7F5'}] transition-colors group`}
              >
                <div className="flex items-start justify-between">
                  <Icon
                    size={20}
                    className={f.highlight ? 'text-[#EF233C]' : 'text-[#0A0A0A]'}
                    strokeWidth={1.5}
                  />
                  <span className={`font-mono text-xs ${f.highlight ? 'text-[#6B7280]' : 'text-[#EF233C]'}`}>
                    {f.num}
                  </span>
                </div>
                <h3
                  className={`font-serif font-semibold text-lg leading-snug ${f.highlight ? 'text-white' : 'text-[#0A0A0A]'}`}
                  style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
                >
                  {f.title}
                </h3>
                <p className={`text-sm leading-relaxed ${f.highlight ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
