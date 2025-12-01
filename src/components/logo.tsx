import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
}

export function ShepLightLogo({ className, size = 32 }: LogoProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
      
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Shepherd's Crook / Staff */}
        <path
          d="M10 28V12C10 7.58172 13.5817 4 18 4C22.4183 4 26 7.58172 26 12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-slate-900 dark:text-white"
        />
        
        {/* The Light (Bulb/Spark) inside the crook */}
        <path
          d="M18 8L18 16M14 12L22 12"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="animate-pulse"
        />
        <circle cx="18" cy="12" r="5" stroke="#F59E0B" strokeWidth="1.5" className="opacity-50" />
      </svg>
    </div>
  )
}
