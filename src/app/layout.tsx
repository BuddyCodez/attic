import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Playfair_Display } from "next/font/google"
// import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "~/providers/theme-provider";
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: "The Digital Attic - Udit's Personal Collection",
  description: "A curated collection of thoughts, reads, and discoveries from Udit's digital attic.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${playfair.variable} attic-texture`}>
        <ThemeProvider defaultTheme="light" storageKey="attic-theme">
          <Suspense fallback={null}>{children}</Suspense>
        </ThemeProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
