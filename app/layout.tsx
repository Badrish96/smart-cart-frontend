import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import ReduxProvider from '@/src/components/common/ReduxProvider'
import ErrorBoundary from '@/src/components/common/ErrorBoundary'
import Toaster from '@/src/components/ui/Toaster'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SmartCart',
  description: 'Dive in Beats',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={geist.variable} data-theme="dark">
      <body className="min-h-full flex flex-col antialiased">
        <ReduxProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  )
}
