import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { X, Users, Calendar, CreditCard, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

const STEPS = [
  {
    icon: Dumbbell,
    title: 'Academia creada',
    desc: 'Tu dojo está listo en MatFlow',
    done: true,
    link: null,
  },
  {
    icon: Users,
    title: 'Agrega tu primer alumno',
    desc: 'Registra a tus alumnos con su cinturón y membresía',
    done: false,
    link: null, // opens modal via button
    action: 'add-member',
  },
  {
    icon: Calendar,
    title: 'Crea tu horario de clases',
    desc: 'Organiza tus clases semanales con tipo y horario',
    done: false,
    link: ROUTES.ADMIN_SCHEDULE_MANAGEMENT,
  },
  {
    icon: CreditCard,
    title: 'Configura los planes de membresía',
    desc: 'Define mensual, trimestral o anual con precios',
    done: false,
    link: ROUTES.ADMIN_MEMBERSHIP_PLANS,
  },
];

interface WelcomeBannerProps {
  onAddMember?: () => void;
}

export function WelcomeBanner({ onAddMember }: WelcomeBannerProps) {
  const [params, setParams] = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const isWelcome = params.get('welcome') === 'true';
  if (!isWelcome || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    params.delete('welcome');
    setParams(params, { replace: true });
  };

  return (
    <div className="relative rounded-xl border border-primary/20 bg-primary/5 p-5 mb-4">
      {/* Close */}
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        aria-label="Cerrar bienvenida"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="pr-6">
        <h2 className="font-semibold text-base text-foreground mb-1">
          ¡Bienvenido a MatFlow!
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Tu academia fue creada. Sigue estos pasos para comenzar:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className={`rounded-lg border p-3 flex flex-col gap-2 ${
                  step.done
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-background'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    step.done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.done ? (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">0{i + 1}</span>
                </div>

                <div>
                  <p className="text-xs font-medium text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{step.desc}</p>
                </div>

                {!step.done && (
                  step.link ? (
                    <Link to={step.link}>
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs mt-1">
                        Ir
                      </Button>
                    </Link>
                  ) : step.action === 'add-member' && onAddMember ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-xs mt-1"
                      onClick={onAddMember}
                    >
                      Agregar
                    </Button>
                  ) : null
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
