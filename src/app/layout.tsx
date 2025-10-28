import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/sidebar'
import { RootLayoutClient } from '@/components/RootLayoutClient'
import { APP_NAME } from '@/lib/constants'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'From idea to clarity in minutes.',
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
      </body>
    </html>
  )
}
