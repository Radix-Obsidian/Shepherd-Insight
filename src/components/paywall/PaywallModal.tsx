'use client'

import { Sparkles, CheckCircle, Infinity, RefreshCw, Code, Zap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LEMONSQUEEZY_PRODUCTS } from '@/lib/lemonsqueezy'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
}

/**
 * Hard limit paywall (shown when user hits 100% of their free tier limit)
 * Full-screen overlay celebrating their progress and offering upgrade
 */
export function PaywallModal({ isOpen, onClose, onUpgrade }: PaywallModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Header - Celebration */}
        <div className="p-8 bg-primary text-primary-foreground">
          <Sparkles className="w-12 h-12 mb-4 opacity-90" />
          <h2 className="text-3xl font-bold mb-2 tracking-tight">
            Invest once in clarity.
          </h2>
          <p className="text-primary-foreground/90 text-lg">
            Save weeks of second-guessing. Your studio awaits.
          </p>
        </div>
        
        {/* What you accomplished */}
        <div className="p-8 bg-secondary/30 border-b border-border/50">
          <h3 className="font-bold text-foreground mb-4">You&apos;ve proven you can:</h3>
          <div className="grid gap-3">
            <div className="flex items-center gap-3 text-foreground/80">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>Find clarity on your problem space</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/80">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>Research your users with real-time web data</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/80">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>Generate a launch-ready MVP blueprint</span>
            </div>
          </div>
        </div>
        
        {/* Why we charge */}
        <div className="p-8 border-b border-border/50">
          <h3 className="font-bold text-foreground mb-3">Why upgrade?</h3>
          <p className="text-muted-foreground mb-4">
            ShepLight’s free tier lets you run a full journey for a real project. When you’re ready to bring in more projects or deeper research, upgrade to keep your studio open as you grow.
          </p>
        </div>
        
        {/* Pro features */}
        <div className="p-8">
          <h3 className="font-bold text-foreground mb-4">
            Upgrade to Pro: ${LEMONSQUEEZY_PRODUCTS.pro.price}/month
          </h3>
          <div className="grid gap-3 mb-6">
            <div className="flex items-start gap-3">
              <Infinity className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Unlimited AI Journeys</p>
                <p className="text-sm text-muted-foreground">Build 10 products in the time it used to take for 1</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Decision Vault Refinement</p>
                <p className="text-sm text-muted-foreground">Refine, replace, and perfect every decision</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Code className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">AI Dev Prompt Generator</p>
                <p className="text-sm text-muted-foreground">Copy → Paste into Claude/Cursor → Build your app</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Priority Support</p>
                <p className="text-sm text-muted-foreground">Get help when you need it</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={onUpgrade}
              size="lg"
              className="flex-1 font-bold shadow-md"
            >
              Upgrade to Pro → ${LEMONSQUEEZY_PRODUCTS.pro.price}/mo
            </Button>
            <Button 
              onClick={onClose}
              variant="ghost"
              className="px-6 py-3 text-muted-foreground hover:text-foreground"
            >
              Maybe Later
            </Button>
          </div>
        </div>
        
      </div>
    </div>
  )
}
