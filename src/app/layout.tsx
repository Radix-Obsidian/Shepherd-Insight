import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/sidebar'
import { RootLayoutClient } from '@/components/RootLayoutClient'
import { APP_NAME } from '@/lib/constants'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: `${APP_NAME} - Light the Way to Your MVP`,
  description: 'Got an idea brewing? Transform it into a clear vision, real personas, and an actionable plan. No more guessing—just clarity.',
  keywords: [
    'MVP planning',
    'startup ideas',
    'product clarity',
    'user personas',
    'founder tools',
    'idea validation',
    'product-market fit',
    'startup journey',
  ],
  authors: [{ name: 'Golden Sheep AI' }],
  creator: 'Golden Sheep AI',
  icons: {
    icon: '/sheplight-logo.png',
    shortcut: '/sheplight-logo.png',
    apple: '/sheplight-logo.png',
  },
  openGraph: {
    title: `${APP_NAME} - Light the Way to Your MVP`,
    description: 'Transform your idea into clarity, personas, and an actionable MVP plan in minutes.',
    type: 'website',
    siteName: APP_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} - Light the Way to Your MVP`,
    description: 'Transform your idea into clarity, personas, and an actionable MVP plan in minutes.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <RootLayoutClient>
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-6">
                {children}
              </div>
            </main>
          </div>
        </RootLayoutClient>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
