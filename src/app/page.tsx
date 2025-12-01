import Link from 'next/link'
import { ShepLightLogo } from '@/components/logo'
import { ArrowRight, Sparkles, ShieldCheck, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background text-foreground transition-colors duration-300">
      
      {/* Hero Section */}
      <div className="max-w-4xl w-full flex flex-col items-center space-y-10 text-center">
        
        {/* Logo with Glow */}
        <div className="relative">
          <ShepLightLogo size={100} glow className="mb-4" />
        </div>

        {/* Headlines */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
            From messy idea to <br className="hidden md:block" />
            <span className="text-primary">confident launch plan.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
            ShepLight is a calm research studio for women in tech. Turn raw ideas into clear personas, validated decisions, and an MVP you’d be proud to ship.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
          <Link href="/compass">
            <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
              Start your first journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          
          {/* Secondary CTA - leading to a demo or dashboard for now */}
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-lg rounded-full border-2 hover:bg-secondary/50 transition-all">
              See how it works
            </Button>
          </Link>
        </div>

        {/* Supporting Tagline */}
        <p className="text-sm text-muted-foreground italic pt-4">
          Guided flows for non-technical founders, designers, and engineers.
        </p>
      </div>

      {/* Value Props / Bullets from Spec */}
      <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full">
        
        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold">Guided Flows</h3>
          <p className="text-muted-foreground">
            No generic templates. Step-by-step clarity for founders who don&apos;t want to drown in docs.
          </p>
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold">Real Research</h3>
          <p className="text-muted-foreground">
            Deep personas and citations backed by AI, not just guesses. Understand who you&apos;re building for.
          </p>
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold">Decision Vault</h3>
          <p className="text-muted-foreground">
            Protect your time. Lock decisions in so you don&apos;t have to re-litigate them in every meeting.
          </p>
        </div>

      </div>
    </div>
  )
}
