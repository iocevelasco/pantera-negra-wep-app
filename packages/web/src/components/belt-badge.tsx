import { cn } from "@/lib/utils"
import type { User } from "@pantera-negra/shared"

type BeltRank = User['rank']

interface BeltBadgeProps {
  // Option 1: Direct props (backward compatible)
  rank?: BeltRank | string
  stripes?: number
  // Option 2: Partial user object
  user?: Partial<Pick<User, 'rank' | 'stripes'>>
  className?: string
}

const MAX_STRIPES = 4

// Belt color configurations
const beltConfig = {
  white: {
    bgColor: "bg-white",
    textColor: "text-neutral-950",
    borderColor: "border-neutral-200",
    stripeBarBg: "bg-neutral-900", // Black background for stripe bar
    stripeColor: "bg-white", // White stripes
  },
  blue: {
    bgColor: "bg-blue-600",
    textColor: "text-white",
    borderColor: "border-blue-700",
    stripeBarBg: "bg-neutral-900",
    stripeColor: "bg-white",
  },
  purple: {
    bgColor: "bg-purple-600",
    textColor: "text-white",
    borderColor: "border-purple-700",
    stripeBarBg: "bg-neutral-900",
    stripeColor: "bg-white",
  },
  brown: {
    bgColor: "bg-amber-800",
    textColor: "text-white",
    borderColor: "border-amber-900",
    stripeBarBg: "bg-neutral-900",
    stripeColor: "bg-white",
  },
  black: {
    bgColor: "bg-neutral-950",
    textColor: "text-white",
    borderColor: "border-neutral-800",
    stripeBarBg: "bg-red-600", // Red background for black belt stripe bar
    stripeColor: "bg-white",
  },
} as const

export function BeltBadge({ rank, stripes, user, className }: BeltBadgeProps) {

  const userRank = user?.rank ?? rank
  const userStripes = user?.stripes ?? stripes ?? 0

  if (!userRank) {
    return (
      <div className={cn("flex items-center gap-0 h-8 rounded-md overflow-hidden border shadow-sm", className)}>
        <div className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm font-medium">
          N/A
        </div>
      </div>
    )
  }

  const rankLower = userRank.toLowerCase() as keyof typeof beltConfig
  const config = beltConfig[rankLower] || beltConfig.white
  const stripeCount = Math.min(Math.max(0, userStripes), MAX_STRIPES)

  return (
    <div className={cn(
      "flex items-center gap-0 h-4 rounded-xs overflow-hidden border w-full",
      config.borderColor,
      className
    )}>
      {/* Belt color section */}
      <div className={cn(
        "px-3 py-1.5 flex items-center justify-center min-w-[100px] flex-1",
        config.bgColor,
        config.textColor
      )}>
      </div>

      {/* Stripe bar section */}
      <div className={cn(
        "flex items-center justify-center h-full px-1 w-[20%]",
        config.stripeBarBg
      )}>
        {/* Stripe indicators */}
        <div className="flex justify-between items-center w-[60%] gap-0.5 h-full">
          {Array.from({ length: MAX_STRIPES }).map((_, index) => (
            <div key={index} className="flex items-center h-full">
              {index < stripeCount ? (
                // Active stripe (white)
                <div className={cn("w-1 h-4", config.stripeColor)} />
              ) : (
                // Inactive stripe (transparent/space)
                <div className="w-1 h-4 bg-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
