import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useRegisterDojo } from '@/hooks/auth/use-register-dojo';
import { MARTIAL_ART_RANKS } from '@pantera-negra/shared';
import { AuthLayout } from '@/components/auth/auth-layout';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  name:            z.string().min(2, 'Ingresa tu nombre completo'),
  email:           z.string().email('Email inválido'),
  password:        z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

const step2Schema = z.object({
  academyName: z.string().min(2, 'Ingresa el nombre de tu academia'),
  martialArt:  z.enum(['BJJ', 'Karate', 'Judo', 'Taekwondo', 'MuayThai', 'MMA', 'Boxing', 'Kickboxing', 'Wrestling', 'Other']),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;

// ─── Martial arts labels ──────────────────────────────────────────────────────

const MARTIAL_ARTS = Object.keys(MARTIAL_ART_RANKS) as (keyof typeof MARTIAL_ART_RANKS)[];
const LABELS: Record<string, string> = {
  BJJ: 'Brazilian Jiu-Jitsu (BJJ)',
  Karate: 'Karate',
  Judo: 'Judo',
  Taekwondo: 'Taekwondo',
  MuayThai: 'Muay Thai',
  MMA: 'Mixed Martial Arts (MMA)',
  Boxing: 'Boxeo',
  Kickboxing: 'Kickboxing',
  Wrestling: 'Wrestling / Lucha',
  Other: 'Otro arte marcial',
};

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {([1, 2] as const).map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          {i > 0 && <div className={cn('h-px w-8 transition-colors', current > step - 1 ? 'bg-primary' : 'bg-border')} />}
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
            current === step && 'bg-primary text-primary-foreground',
            current > step && 'bg-primary/20 text-primary',
            current < step && 'bg-muted text-muted-foreground',
          )}>
            {current > step ? <Check className="h-4 w-4" /> : step}
          </div>
        </div>
      ))}
      <div className="ml-2 text-xs text-muted-foreground">
        {current === 1 ? 'Tu cuenta' : 'Tu academia'}
      </div>
    </div>
  );
}

// ─── Step 1 — Account ─────────────────────────────────────────────────────────

function Step1Form({ onNext }: { onNext: (data: Step1) => void }) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Step1>({
    resolver: zodResolver(step1Schema),
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="flex items-center gap-2 mb-6 text-muted-foreground">
        <User className="h-4 w-4" />
        <span className="text-sm">Datos de tu cuenta de administrador</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre completo *</Label>
        <Input id="name" placeholder="Tu nombre" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" placeholder="tu@email.com" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPw ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            className={cn('pr-10', errors.password ? 'border-destructive' : '')}
            {...register('password')}
          />
          <button type="button" onClick={() => setShowPw(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repite tu contraseña"
            className={cn('pr-10', errors.confirmPassword ? 'border-destructive' : '')}
            {...register('confirmPassword')}
          />
          <button type="button" onClick={() => setShowConfirm(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full gap-2 mt-2">
        Continuar <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

// ─── Step 2 — Dojo ────────────────────────────────────────────────────────────

function Step2Form({
  onBack,
  onSubmit,
  isLoading,
}: {
  onBack: () => void;
  onSubmit: (data: Step2) => void;
  isLoading: boolean;
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Step2>({
    resolver: zodResolver(step2Schema),
    defaultValues: { martialArt: 'BJJ' },
  });

  const selectedArt = watch('martialArt');
  const ranks = selectedArt ? MARTIAL_ART_RANKS[selectedArt] : [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-2 mb-6 text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Datos de tu academia</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="academyName">Nombre de la academia *</Label>
        <Input
          id="academyName"
          placeholder="Ej: Dragon's Gate Dojo"
          {...register('academyName')}
          className={errors.academyName ? 'border-destructive' : ''}
        />
        {errors.academyName && <p className="text-xs text-destructive">{errors.academyName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Arte marcial *</Label>
        <Select
          value={selectedArt}
          onValueChange={(v) => setValue('martialArt', v as Step2['martialArt'])}
        >
          <SelectTrigger className={errors.martialArt ? 'border-destructive' : ''}>
            <SelectValue placeholder="Selecciona el arte marcial" />
          </SelectTrigger>
          <SelectContent>
            {MARTIAL_ARTS.map(art => (
              <SelectItem key={art} value={art}>{LABELS[art] ?? art}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.martialArt && <p className="text-xs text-destructive">{errors.martialArt.message}</p>}
      </div>

      {/* Rank system preview */}
      {ranks.length > 0 && (
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">Sistema de rangos incluido:</p>
          <div className="flex flex-wrap gap-2">
            {ranks.map(r => (
              <div key={r.key} className="flex items-center gap-1 text-xs">
                <span
                  className="inline-block h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: r.color, borderColor: r.color === '#FFFFFF' ? '#e2e8f0' : r.color }}
                />
                <span className="text-muted-foreground">{r.label.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2 flex-1">
          <ArrowLeft className="h-4 w-4" /> Atrás
        </Button>
        <Button type="submit" disabled={isLoading} className="gap-2 flex-1">
          {isLoading ? 'Creando...' : 'Crear mi academia'}
          {!isLoading && <Check className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function RegisterDojoPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<Step1 | null>(null);
  const registerMutation = useRegisterDojo();

  const handleStep1 = (data: Step1) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2 = (data: Step2) => {
    if (!step1Data) return;
    registerMutation.mutate({
      name: step1Data.name,
      email: step1Data.email,
      password: step1Data.password,
      academyName: data.academyName,
      martialArt: data.martialArt,
    });
  };

  return (
    <AuthLayout containerClassName="relative z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MatFlow" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">Registra tu academia</h1>
              <p className="text-xs text-white/60">Gratis · Sin tarjeta de crédito</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <StepIndicator current={step} />

          {step === 1 && <Step1Form onNext={handleStep1} />}
          {step === 2 && (
            <Step2Form
              onBack={() => setStep(1)}
              onSubmit={handleStep2}
              isLoading={registerMutation.isPending}
            />
          )}
        </div>

        {/* Footer links */}
        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-white/70">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-white font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
          <p className="text-sm text-white/70">
            ¿Eres alumno buscando una academia?{' '}
            <Link to="/register" className="text-white font-medium hover:underline">
              Registrarse como alumno
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
