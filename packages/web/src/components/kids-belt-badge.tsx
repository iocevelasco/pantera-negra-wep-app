import { cn } from "@/lib/utils"
import type { User } from "@pantera-negra/shared"

// Kids belt ranks for BJJ
type KidsBeltRank = 'White' | 'Grey' | 'Yellow' | 'Orange' | 'Green'

interface KidsBeltBadgeProps {
  // Option 1: Direct props
  rank?: KidsBeltRank | string
  stripes?: number
  // Option 2: Partial user object (for kids, rank might be stored differently)
  user?: Partial<Pick<User, 'rank' | 'stripes'>>
  className?: string
  // Optional: Show age range label
  showAgeRange?: boolean
}

const MAX_STRIPES = 4

// Kids belt color configurations based on BJJ kids belt system
const kidsBeltConfig = {
  white: {
    bgColor: "bg-white",
    textColor: "text-neutral-950",
    borderColor: "border-neutral-200",
    stripeBarBg: "bg-neutral-900", // Black background for stripe bar
    stripeColor: "bg-white", // White stripes
    ageRange: null, // White belt has no age restriction
  },
  grey: {
    bgColor: "bg-neutral-400",
    textColor: "text-neutral-950",
    borderColor: "border-neutral-500",
    stripeBarBg: "bg-neutral-900",
    stripeColor: "bg-white",
    ageRange: "4-6", // Grey belt for ages 4-6
  },
  yellow: {
    bgColor: "bg-yellow-400",
    textColor: "text-neutral-950",
    borderColor: "border-yellow-500",
    stripeBarBg: "bg-neutral-900",
    stripeColor: "bg-white",
    ageRange: "7+", // Yellow belt for ages 7 and up
  },
  orange: {
    bgColor: "bg-orange-500",
    textColor: "text-white",
    borderColor: "border-orange-600",
    stripeBarBg: "bg-neutral-900",
    stripeColor: "bg-white",
    ageRange: "10+", // Orange belt for ages 10 and up
  },
  green: {
    bgColor: "bg-green-600",
    textColor: "text-white",
    borderColor: "border-green-700",
    stripeBarBg: "bg-neutral-900",
    stripeColor: "bg-white",
    ageRange: "13+", // Green belt for ages 13 and up
  },
} as const

export function KidsBeltBadge({ rank, stripes, user, className, showAgeRange = false }: KidsBeltBadgeProps) {
  // Extract rank and stripes from user object if provided, otherwise use direct props
  const userRank = user?.rank ?? rank
  const userStripes = user?.stripes ?? stripes ?? 0

  // Handle undefined rank gracefully
  if (!userRank) {
    return (
      <div className={cn("flex items-center gap-0 h-8 rounded-md overflow-hidden border shadow-sm", className)}>
        <div className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm font-medium">
          N/A
        </div>
      </div>
    )
  }

  // Normalize rank to lowercase for config lookup
  const rankLower = userRank.toLowerCase() as keyof typeof kidsBeltConfig
  const config = kidsBeltConfig[rankLower] || kidsBeltConfig.white
  const stripeCount = Math.min(Math.max(0, userStripes), MAX_STRIPES)

  return (
    <div className={cn(
      "flex items-center gap-0 h-4 rounded-xs overflow-hidden border w-full",
      config.borderColor,
      className
    )}>
      {/* Belt color section */}
      <div className={cn(
        "px-3 py-1.5 flex items-center justify-center min-w-[100px] flex-1 relative",
        config.bgColor,
        config.textColor
      )}>
        {/* Show age range label if enabled and available */}
        {showAgeRange && config.ageRange && (
          <span className="text-xs font-semibold">
            {rankLower.toUpperCase()} ({config.ageRange})
          </span>
        )}
      </div>

      {/* Stripe bar section */}
      <div className={cn(
        "flex items-center h-full px-1",
        config.stripeBarBg
      )}>
        {/* Stripe indicators */}
        <div className="flex items-center gap-0.5 h-full">
          {Array.from({ length: MAX_STRIPES }).map((_, index) => (
            <div key={index} className="flex items-center h-full">
              {index < stripeCount ? (
                // Active stripe (white)
                <div className={cn("w-1 h-4", config.stripeColor)} />
              ) : (
                // Inactive stripe (gray/transparent placeholder)
                <div className="w-1 h-4 bg-neutral-700 opacity-30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

