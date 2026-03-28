import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'LK Parts — Vehicle Spare Parts Sri Lanka',
  description:
    'Find exact spare parts for your vehicle. Verified fitment for Honda, Yamaha, Toyota, and more. Fast delivery across Sri Lanka.',
  keywords: ['spare parts', 'Sri Lanka', 'vehicle parts', 'Honda', 'Yamaha', 'Toyota'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--bg)]">
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
