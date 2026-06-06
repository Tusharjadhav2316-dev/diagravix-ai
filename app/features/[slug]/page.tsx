import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, ArrowRight, Zap, CheckCircle2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageData {
  title: string
  subtitle: string
  description: string
  heroBadge: string
  features: string[]
  useCases: string[]
  faq: Array<{ q: string; a: string }>
}

const FEATURE_PAGES: Record<string, PageData> = {
  "ai-diagram-generator": {
    title: "AI Diagram Generator",
    subtitle: "Turn complex system models into clean visuals instantly.",
    description: "Describe your system architectures, execution steps, or web workflows in plain English. Diagravix AI generates standard layouts instantly on a modern canvas.",
    heroBadge: "AI-Powered Technical Modeling",
    features: [
      "Generates correct layouts with zero manual alignment",
      "Collision-free auto-arranger engine",
      "Interactive nodes, handles, and custom edge connectors",
      "Export to Mermaid, PlantUML, PNG, and PDF formats",
    ],
    useCases: [
      "System architecture charts",
      "Web app communication flowcharts",
      "High-level microservice interaction maps",
      "Tech specs and project documentations",
    ],
    faq: [
      {
        q: "How does the AI diagram generator work?",
        a: "Simply type a natural language prompt (e.g. 'A user authentication system with Google Login and Firestore checks'). The AI parses your prompt, identifies the system components and edges, and layouts them automatically.",
      },
      {
        q: "Can I manually customize the generated diagram?",
        a: "Yes! The canvas is fully interactive. You can drag nodes, edit labels, adjust shapes, drag connector lines between handles, and delete components.",
      },
    ],
  },
  "ai-flowchart-generator": {
    title: "AI Flowchart Generator",
    subtitle: "Generate clean chronological process charts in seconds.",
    description: "Map execution flows, loops, logical branches, and validation check paths using AI. Avoid complex manual layout editors and let process modeling write itself.",
    heroBadge: "Smart Process Mapping",
    features: [
      "Smart node shape mapping (Start, End, Process, Decision)",
      "Instant connection lines with conditional text (e.g. 'If Yes')",
      "Zero overlapping path routing",
      "Interactive flowchart manual drafting",
    ],
    useCases: [
      "Software workflow models",
      "Onboarding and user journey routes",
      "Logical algorithm trees and branch checks",
      "Business and support execution flows",
    ],
    faq: [
      {
        q: "What flowchart shapes are supported?",
        a: "We support process boxes, decision diamonds, oval start/end caps, and component layers.",
      },
      {
        q: "Can I export my flowchart to standard formats?",
        a: "Yes. Export flowcharts to PNG, SVG, PDF, or text code formats (Mermaid/PlantUML).",
      },
    ],
  },
  "uml-diagram-generator": {
    title: "UML Diagram Generator",
    subtitle: "AI-powered UML class and object modeling from description.",
    description: "Generate object-oriented software models, inheritance structures, system dependencies, and interface architectures from text notes.",
    heroBadge: "OOP Software Architecture",
    features: [
      "Standard UML Class node blocks",
      "Class inheritance relationship connectors (extends, implements)",
      "Structured OOP model hierarchy rendering",
      "Clean code exports for developer documents",
    ],
    useCases: [
      "UML Class diagrams",
      "Component dependencies maps",
      "Service interface structural schemas",
      "Code documentation diagrams",
    ],
    faq: [
      {
        q: "Does Diagravix generate UML relationship lines?",
        a: "Yes, it automatically detects inheritances and dependencies, rendering arrows pointing to base classes or interfaces.",
      },
      {
        q: "Is it suitable for large UML class diagrams?",
        a: "Yes, our automated positioning engine easily handles multi-class trees without clutter.",
      },
    ],
  },
  "er-diagram-generator": {
    title: "Entity Relationship (ER) Generator",
    subtitle: "Model SQL database tables and foreign keys instantly.",
    description: "Write your database schema outline or describe relations in plain English. Watch AI build entity-relationship models with precise link cardinalities.",
    heroBadge: "Database Schema Visualizer",
    features: [
      "Structured table entity nodes",
      "Cardinality relationship mapping (1-to-many, 1-to-1)",
      "Foreign key connectors",
      "Ready-to-use Mermaid ER diagram format code export",
    ],
    useCases: [
      "SQL database tables modeling",
      "NoSQL database model outlines",
      "Foreign key constraints mapping",
      "Database migration planning documentation",
    ],
    faq: [
      {
        q: "Can I generate database schemas for PostgreSQL or MySQL?",
        a: "Describe your tables and relations, and Diagravix will generate the ER diagram showing columns, primary keys, and cardinalities.",
      },
      {
        q: "Does it export SQL commands?",
        a: "Currently, it exports visual ER diagrams, Mermaid scripts, and PlantUML formats. SQL DDL code generator features are coming soon.",
      },
    ],
  },
  "sequence-diagram-generator": {
    title: "Sequence Diagram Generator",
    subtitle: "Map chronological message flows and service calls.",
    description: "Model backend API calls, user-to-interface requests, microservices message broker communications, and system lifecycle calls visually.",
    heroBadge: "Chronological Call Flows",
    features: [
      "System actor and interface components",
      "Chronological execution message routing lines",
      "Responsive lifecycles representation",
      "Optimized flow spacing layouts",
    ],
    useCases: [
      "API request-response lifecycles",
      "Microservice broker message events",
      "User-to-system frontend routes",
      "Authentication and handshake protocols",
    ],
    faq: [
      {
        q: "What is a sequence diagram?",
        a: "A sequence diagram details how processes or services interact with each other in chronological order to complete a workflow.",
      },
      {
        q: "Can I edit the chronological order manually?",
        a: "Yes, you can edit labels, reconnect messages, and add node steps dynamically on the vector canvas.",
      },
    ],
  },
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return [
    { slug: "ai-diagram-generator" },
    { slug: "ai-flowchart-generator" },
    { slug: "uml-diagram-generator" },
    { slug: "er-diagram-generator" },
    { slug: "sequence-diagram-generator" },
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = FEATURE_PAGES[slug]
  if (!data) return {}

  const description = `${data.subtitle} ${data.description}`.slice(0, 155)

  return {
    title: `${data.title} — Diagravix AI`,
    description,
    alternates: {
      canonical: `/features/${slug}`,
    },
    openGraph: {
      title: `${data.title} — Diagravix AI`,
      description,
      url: `https://diagravix.ai/features/${slug}`,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${data.title} page preview`,
        },
      ],
    },
  }
}

export default async function FeatureLandingPage({ params }: Props) {
  const { slug } = await params
  const data = FEATURE_PAGES[slug]

  if (!data) {
    return (
      <div className="min-h-screen bg-[#07080d] flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-[#f7f8ff]">Page Not Found</h1>
          <p className="text-sm text-[#677086] mt-2 mb-6">The feature page you are looking for does not exist.</p>
          <Link href="/">
            <Button className="bg-[#7c5cff] hover:bg-[#7c5cff]/90 text-white rounded-lg">Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Schema Markup (JSON-LD) for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `${data.title} — Diagravix AI`,
    "description": data.description,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
    },
    "featureList": data.features,
  }

  return (
    <div className="min-h-screen bg-[#07080d] text-[#f7f8ff] relative overflow-hidden font-sans antialiased">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7c5cff]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#22d3ee]/5 rounded-full blur-3xl" />
      </div>

      {/* JSON-LD Script tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-white/5 bg-[#0d1018]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7c5cff] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#f7f8ff]">Diagravix AI</span>
          </Link>
          <Link href="/editor">
            <Button size="sm" className="bg-[#7c5cff] hover:bg-[#7c5cff]/90 text-white rounded-lg px-4 text-xs h-8">
              Open Canvas
            </Button>
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <div className="flex items-center gap-1.5 text-xs text-[#677086]">
          <Link href="/" className="hover:text-[#a5adc2] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#a5adc2]">{data.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#7c5cff]/20 bg-[#7c5cff]/5 text-xs text-[#7c5cff] font-medium transition-all duration-300 hover:border-[#7c5cff]/40">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          {data.heroBadge}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#f7f8ff]">
          Free Online <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7c5cff] to-[#22d3ee]">{data.title}</span>
        </h1>

        <p className="text-base text-[#a5adc2] max-w-xl mx-auto leading-relaxed">
          {data.subtitle} {data.description}
        </p>

        <div className="pt-4">
          <Link href="/editor">
            <Button size="lg" className="bg-[#7c5cff] hover:bg-[#7c5cff]/90 text-white font-semibold px-8 rounded-lg shadow-lg shadow-[#7c5cff]/25 gap-2 transition-all duration-300 hover:scale-105">
              Start Generating Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Content */}
      <section className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-white/5">
        {/* Core Capabilities */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#f7f8ff]">Core Capabilities</h2>
          <div className="space-y-3">
            {data.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-sm text-[#a5adc2]">
                <CheckCircle2 className="w-4 h-4 text-[#7c5cff] shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#f7f8ff]">Common Use Cases</h2>
          <div className="space-y-3">
            {data.useCases.map((useCase, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-sm text-[#a5adc2]">
                <Zap className="w-4 h-4 text-[#22d3ee] shrink-0 mt-0.5" />
                <span>{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5 space-y-6">
        <h2 className="text-2xl font-bold text-[#f7f8ff] text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto pt-4">
          {data.faq.map((faqItem, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-white/5 bg-[#0d1018]/30 space-y-2">
              <h3 className="text-sm font-bold text-[#f7f8ff]">{faqItem.q}</h3>
              <p className="text-xs text-[#a5adc2] leading-relaxed">{faqItem.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center border-t border-white/5">
        <div className="p-8 md:p-12 rounded-2xl border border-white/5 bg-gradient-to-br from-[#0d1018] to-[#07080d] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c5cff]/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#f7f8ff]">
            Build clean schemas in seconds.
          </h2>
          <p className="text-xs md:text-sm text-[#a5adc2] max-w-md mx-auto leading-relaxed">
            Create an account on Diagravix AI to save multiple models, track generation statistics, toggle shared visibilities, and copy public links.
          </p>
          <div className="pt-2">
            <Link href="/editor">
              <Button size="lg" className="bg-[#7c5cff] hover:bg-[#7c5cff]/90 text-white rounded-lg px-8 gap-2 transition-all duration-300 hover:scale-105">
                Open AI Canvas
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#07080d] py-8 text-center text-xs text-[#677086] relative z-10">
        <p>© 2026 Diagravix AI. All rights reserved. Free software engineering visualization tools.</p>
      </footer>
    </div>
  )
}
