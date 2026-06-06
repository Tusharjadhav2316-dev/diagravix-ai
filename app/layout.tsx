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
    default: "Diagravix AI — Free AI Flowchart & Diagram Generator",
    template: "%s | Diagravix AI",
  },
  description: "Create UML class diagrams, database schemas, flowcharts, and sequence models instantly with plain English text. A premium, collaborative editor for developers and product teams.",
  keywords: [
    "AI flowchart generator",
    "AI diagram generator",
    "UML diagram generator",
    "ER diagram generator",
    "sequence diagram generator",
    "text to diagram",
    "mermaid generator",
    "plantuml generator",
    "software architecture tool"
  ],
  generator: "Diagravix AI",
  applicationName: "Diagravix AI",
  metadataBase: new URL("https://diagravix.ai"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Diagravix AI — Turn Text into Technical Diagrams Instantly",
    description: "Describe system architectures, flows, or databases in plain English. Watch AI lay out interactive, auto-arranged diagrams on a premium vector canvas.",
    url: "https://diagravix.ai",
    siteName: "Diagravix AI",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Diagravix AI Technical Modeling Editor Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Diagravix AI — AI Flowchart & UML Diagram Generator",
    description: "Draw architectural concepts, data structures, and chronological charts instantly with AI layout orchestration.",
    images: ["/og-image.png"],
    creator: "@diagravix",
  },
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
