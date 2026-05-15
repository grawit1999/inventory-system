import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'คลัง JOMZON',
  description: 'Inventory Management System',
  icons: { icon: '/Logo_JZ.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${geist.className} min-h-screen`} style={{ background: 'var(--background)' }}>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-8 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  )
}
