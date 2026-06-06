import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { FirebaseAuthProvider } from "@/components/firebase-auth-provider"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Diagravix AI",
    template: "%s | Diagravix AI",
  },
  description: "Turn ideas into production-ready diagrams in seconds.",
  generator: "Diagravix AI",
  applicationName: "Diagravix AI",
  metadataBase: new URL("https://diagravix.ai"),
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
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
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <FirebaseAuthProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0d1018",
                border: "1px solid rgba(255,255,255,0.05)",
                color: "#f7f8ff",
              },
            }}
          />
          <Analytics />
        </FirebaseAuthProvider>
      </body>
    </html>
  )
}
