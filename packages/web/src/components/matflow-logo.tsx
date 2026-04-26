import { cn } from '@/lib/utils';

interface MatFlowLogoProps {
  /** Variant controls color scheme */
  variant?: 'dark' | 'light' | 'auto';
  /** Size of the mark (the red square) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show only the mark without text */
  markOnly?: boolean;
  className?: string;
}

const sizes = {
  sm: { mark: 'h-6 w-6', text: 'text-base' },
  md: { mark: 'h-8 w-8', text: 'text-xl' },
  lg: { mark: 'h-10 w-10', text: 'text-2xl' },
  xl: { mark: 'h-12 w-12', text: 'text-3xl' },
};

/** MatFlow brand logo — mark + wordmark */
export function MatFlowLogo({
  variant = 'auto',
  size = 'md',
  markOnly = false,
  className,
}: MatFlowLogoProps) {
  const s = sizes[size];

  const textColor =
    variant === 'dark'  ? 'text-[#0A0A0A]' :
    variant === 'light' ? 'text-white' :
    'text-foreground';

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      {/* Mark — red square with M */}
      <div
        className={cn('shrink-0 flex items-center justify-center bg-[#EF233C]', s.mark)}
        style={{ borderRadius: '2px' }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-[60%] h-[60%]">
          <path
            d="M3 18V6l9 6 9-6v12"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {!markOnly && (
        <span
          className={cn('font-bold tracking-tight leading-none', s.text, textColor)}
          style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
        >
          Mat<span className="text-[#EF233C]">Flow</span>
        </span>
      )}
    </div>
  );
}

/** Compact text-only logo for tight spaces */
export function MatFlowWordmark({
  variant = 'auto',
  className,
}: Pick<MatFlowLogoProps, 'variant' | 'className'>) {
  const textColor =
    variant === 'dark'  ? 'text-[#0A0A0A]' :
    variant === 'light' ? 'text-white' :
    'text-foreground';

  return (
    <span
      className={cn('font-bold tracking-tight', textColor, className)}
      style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
    >
      Mat<span className="text-[#EF233C]">Flow</span>
    </span>
  );
}
