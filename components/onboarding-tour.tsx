"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Cpu,
  Layers,
  Settings,
  Share2,
  CheckCircle,
} from "lucide-react"

interface OnboardingTourProps {
  open: boolean
  onClose: () => void
}

interface TourStep {
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

export default function OnboardingTour({ open, onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)

  // Reset to first step if reopened
  useEffect(() => {
    if (open) {
      setCurrentStep(0)
    }
  }, [open])

  const steps: TourStep[] = [
    {
      title: "Welcome to Diagravix AI",
      description: "Transform complex ideas and system architectures into production-grade interactive diagrams instantly using natural language.",
      icon: <Sparkles className="w-8 h-8 text-[#7c5cff]" />,
      color: "from-[#7c5cff]/20 to-[#7c5cff]/5 border-[#7c5cff]/30 text-[#7c5cff]",
    },
    {
      title: "AI Generation Engine",
      description: "Describe your system on the left pane. Diagravix parses your description and builds a structured, auto-laid-out diagram instantly.",
      icon: <Cpu className="w-8 h-8 text-[#22d3ee]" />,
      color: "from-[#22d3ee]/20 to-[#22d3ee]/5 border-[#22d3ee]/30 text-[#22d3ee]",
    },
    {
      title: "Interactive Drawing Canvas",
      description: "Manually drag nodes, click node handles to connect them, and use keyboard shortcuts for rapid flow organization and layout edits.",
      icon: <Layers className="w-8 h-8 text-[#22c55e]" />,
      color: "from-[#22c55e]/20 to-[#22c55e]/5 border-[#22c55e]/30 text-[#22c55e]",
    },
    {
      title: "Custom properties",
      description: "Fine-tune properties on the right side pane. Change shapes, edit names, customize types (decision, database, actor), and delete items.",
      icon: <Settings className="w-8 h-8 text-orange-400" />,
      color: "from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400",
    },
    {
      title: "Premium Sharing & Exports",
      description: "Export high-resolution PNGs (standard or print-quality 3x), SVGs, PDFs, or raw JSON. Toggle visibility to public and copy the link to share.",
      icon: <Share2 className="w-8 h-8 text-pink-400" />,
      color: "from-pink-500/20 to-pink-500/5 border-pink-500/30 text-pink-400",
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const activeStep = steps[currentStep]

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose() }}>
      <DialogContent className="sm:max-w-[480px] bg-[#0d1018]/95 border-white/10 text-[#f7f8ff] backdrop-blur-xl rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Animated Slide content */}
        <div className="relative min-h-[280px] flex flex-col justify-between pt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col items-center text-center space-y-4"
            >
              {/* Step Icon Container */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeStep.color} border flex items-center justify-center shadow-lg`}>
                {activeStep.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-[#f7f8ff] tracking-tight mt-2">
                {activeStep.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-[#a5adc2] max-w-sm leading-relaxed px-2">
                {activeStep.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-6">
            {/* Step Indicators */}
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-1 rounded-full cursor-pointer transition-all duration-300 ${
                    idx === currentStep ? "w-6 bg-[#7c5cff]" : "w-2 bg-white/10 hover:bg-white/20"
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  className="text-[#a5adc2] hover:text-[#f7f8ff] hover:bg-white/5 text-xs h-8 px-3 gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleNext}
                className="bg-[#7c5cff] hover:bg-[#7c5cff]/90 text-white text-xs h-8 px-4 gap-1 rounded-lg"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Finish
                    <CheckCircle className="w-3.5 h-3.5 ml-0.5" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
