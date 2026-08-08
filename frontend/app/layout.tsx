import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppLayout } from '@/components/app-layout'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nexus Control | Mission Operations',
  description: 'A live command center for monitoring mission health, resources, anomalies, and operator activity.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f8fafc',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased">
        <TooltipProvider>
          <AppLayout>{children}</AppLayout>
        </TooltipProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
