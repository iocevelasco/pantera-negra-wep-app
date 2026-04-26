import { Check } from 'lucide-react';

const INCLUDES = [
  'Alumnos ilimitados',
  'Membresías ilimitadas',
  'Asistencia ilimitada',
  'Clases y horarios',
  'Registro de pagos',
  'Clases privadas',
  'Múltiples dojos (red de academias)',
  'Sistemas de rango por arte marcial',
  'Dashboard y estadísticas',
  'Notificaciones push',
  'Acceso desde celular y computadora',
  'Actualizaciones incluidas — siempre',
];

export function Pricing() {
  return (
    <section id="precios" className="py-24 px-6 bg-[#F7F7F5]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-16 items-start">
          {/* Left: proposition */}
          <div>
            <span className="section-label block mb-4">Precios</span>
            <h2
              className="text-4xl md:text-5xl font-serif font-bold text-[#0A0A0A] leading-tight mb-6"
              style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
            >
              Gratuito.
              <br />
              Sin asteriscos.
            </h2>
            <p className="text-[#6B7280] text-lg leading-relaxed mb-8">
              MatFlow es completamente gratuito. No hay plan de pago, no hay funciones bloqueadas, no hay límite de alumnos. Todo lo que ves es lo que obtienes — gratis.
            </p>
            <div className="border border-[#E5E5E3] bg-[#FFFFFF] p-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="text-5xl font-serif font-bold text-[#0A0A0A]"
                  style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
                >
                  $0
                </span>
                <span className="text-[#6B7280] text-sm">/ mes</span>
              </div>
              <p className="text-xs text-[#EF233C] font-mono mb-6">Para siempre — sin tarjeta de crédito</p>
              <a
                href="https://pantera-negra-app.fly.dev/register-dojo"
                className="block text-center bg-[#EF233C] text-white font-medium py-3 text-sm hover:bg-[#C41E30] transition-colors"
                style={{ borderRadius: '2px' }}
              >
                Empieza Gratis Ahora
              </a>
            </div>
          </div>

          {/* Right: includes */}
          <div>
            <p className="text-sm font-medium text-[#0A0A0A] mb-6">Todo incluido en el plan gratuito:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INCLUDES.map(item => (
                <div key={item} className="flex items-start gap-3">
                  <Check size={14} className="text-[#EF233C] mt-0.5 shrink-0" strokeWidth={2.5} />
                  <span className="text-sm text-[#0A0A0A]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
