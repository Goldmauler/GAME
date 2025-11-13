import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
// @ts-ignore: allow side-effect import of CSS without type declarations
import "./globals.css"

const geist = Geist({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  display: 'swap',
  preload: false, // Secondary font, defer loading
})

export const metadata: Metadata = {
  title: "IPL Cricket Auction Game",
  description: "An interactive cricket auction game with team rating analysis and AI-powered insights",
  generator: "v0.app",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to WebSocket server for faster connection */}
        <link rel="preconnect" href="https://game-websocket-7qw0.onrender.com" />
        <link rel="dns-prefetch" href="https://game-websocket-7qw0.onrender.com" />
      </head>
      <body className={`${geist.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
