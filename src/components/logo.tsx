import Image from 'next/image'
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
  glow?: boolean
}

export function ShepLightLogo({ className, size = 42, glow = false }: LogoProps) {
  return (
    <div className={cn(glow && "relative", className)} style={{ width: size, height: size }}>
      {glow && (
        <div className="absolute inset-0 blur-2xl rounded-full bg-amber-300/30 animate-pulse" />
      )}
      <Image 
        src="/sheplight-logo.png" 
        alt="Sheplight Logo" 
        width={size} 
        height={size}
        className={cn("relative z-10 object-contain", glow && "drop-shadow-lg")}
        priority
      />
    </div>
  )
}
