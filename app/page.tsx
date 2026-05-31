"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Layers, 
  Share2, 
  Download, 
  Shield, 
  Cpu,
  CheckCircle,
  HelpCircle,
  X,
  KeyRound,
  Mail,
  User,
  Lock,
  ArrowLeft
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/stores/auth-store"
import { toast } from "sonner"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export default function LandingPage() {
  const { user, loading, error, loginUser, registerUser, sendOtp, verifyOtpAndResetPassword, logoutUser, clearError } = useAuthStore()

  // Auth Dialog States
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login")
  
  // Forgot Password Wizard States
  const [forgotStep, setForgotStep] = useState<"username" | "otp" | "reset">("username")
  const [resetTimer, setResetTimer] = useState(60)
  const [resendActive, setResendActive] = useState(false)

  // Form Inputs
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otpVal, setOtpVal] = useState("")
  
  // Interactive Hero Preview Demo State
  const [demoPrompt, setDemoPrompt] = useState("User signs up, database verifies, dashboard loads")
  const [demoGenerating, setDemoGenerating] = useState(false)
  const [demoStep, setDemoStep] = useState(0)

  // Timer for OTP Resend
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (authOpen && authMode === "forgot" && forgotStep === "otp" && resetTimer > 0) {
      interval = setInterval(() => {
        setResetTimer((t) => t - 1)
      }, 1000)
    } else if (resetTimer === 0) {
      setResendActive(true)
    }
    return () => clearInterval(interval)
  }, [authOpen, authMode, forgotStep, resetTimer])

  // Clear errors when changing tabs
  useEffect(() => {
    clearError()
  }, [authMode, authOpen, clearError])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all credentials.")
      return
    }
    const success = await loginUser(username, password)
    if (success) {
      toast.success("Successfully logged in!")
      setAuthOpen(false)
      // Reset form
      setUsername("")
      setPassword("")
    } else {
      toast.error(error || "Invalid username/email or password.")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all registration fields.")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }
    const success = await registerUser(username, email, password)
    if (success) {
      toast.success("Registration successful!")
      setAuthOpen(false)
      setUsername("")
      setEmail("")
      setPassword("")
    } else {
      toast.error(error || "Registration failed.")
    }
  }

  const handleForgotUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      toast.error("Please enter your username.")
      return
    }
    const success = await sendOtp(username)
    if (success) {
      toast.success("A validation code has been sent! Check your logs.")
      setForgotStep("otp")
      setResetTimer(60)
      setResendActive(false)
    } else {
      toast.error(error || "Username not found.")
    }
  }

  const handleForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpVal.length < 6) {
      toast.error("Please enter a valid 6-digit verification code.")
      return
    }
    // Set wizard to reset password step
    setForgotStep("reset")
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }
    const success = await verifyOtpAndResetPassword(username, otpVal, password)
    if (success) {
      toast.success("Password reset successfully! You can now log in.")
      setAuthMode("login")
      setForgotStep("username")
      setPassword("")
      setConfirmPassword("")
      setOtpVal("")
    } else {
      toast.error(error || "Failed to reset password.")
    }
  }

  const startDemoGeneration = () => {
    setDemoGenerating(true)
    setDemoStep(1)
    setTimeout(() => setDemoStep(2), 1200)
    setTimeout(() => setDemoStep(3), 2400)
    setTimeout(() => {
      setDemoGenerating(false)
      toast.success("Demo diagram generated successfully!")
    }, 3500)
  }

  return (
    <div className="min-h-screen bg-base text-primary relative overflow-hidden font-sans bg-grid-pattern antialiased">
      {/* Background radial highlight */}
      <div className="absolute top-[-10%] left-[5%] right-[5%] h-[600px] rounded-full mesh-gradient-glow pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[0%] w-[500px] h-[500px] rounded-full mesh-gradient-glow pointer-events-none z-0 opacity-50" />

      {/* Header/Navbar */}
      <header className="border-b border-subtle bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-accent-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-text-primary">Diagravix AI</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-text-secondary font-medium">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#workflow" className="hover:text-text-primary transition-colors">Workflow</a>
            <a href="#templates" className="hover:text-text-primary transition-colors">Templates</a>
            <a href="#docs" className="hover:text-text-primary transition-colors">Docs</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/editor">
                  <Button variant="default" className="bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg">
                    Go to Editor
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Button 
                  onClick={logoutUser} 
                  variant="outline" 
                  className="border-subtle hover:bg-surface text-text-secondary hover:text-text-primary"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
                  variant="ghost" 
                  className="text-text-secondary hover:text-text-primary hover:bg-surface"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => { setAuthMode("register"); setAuthOpen(true); }}
                  className="bg-accent-primary hover:bg-accent-primary/90 text-white font-medium rounded-lg"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-subtle bg-surface/80 text-xs text-accent-cyan font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>Powered by Gemini 2.5 Flash</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] text-text-primary">
            Turn complex ideas into <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-cyan to-accent-green">
              production-grade diagrams
            </span> in seconds.
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto font-medium">
            Describe your system, data flow, or architecture in plain English. Let AI generate correct, interactive layouts instantly on a modern canvas.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link href={user ? "/editor" : "#"}>
              <Button 
                onClick={user ? undefined : () => { setAuthMode("register"); setAuthOpen(true); }}
                size="lg" 
                className="bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold px-8 rounded-lg shadow-lg shadow-accent-primary/20 w-full sm:w-auto"
              >
                Try Diagravix Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="border-subtle hover:bg-surface text-text-secondary hover:text-text-primary px-8 rounded-lg w-full sm:w-auto">
                Explore Features
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Live Demo Preview in Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 border border-subtle rounded-xl bg-surface/30 backdrop-blur-sm p-2 max-w-5xl mx-auto shadow-2xl relative"
        >
          <div className="border border-subtle/80 rounded-lg overflow-hidden bg-bg-base/90 aspect-video flex flex-col">
            {/* Window bar */}
            <div className="bg-surface/80 border-b border-subtle px-4 py-3 flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-accent-green/70" />
                <span className="ml-2 font-mono text-[10px]">editor.diagravix.ai/workspace</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-surface px-2.5 py-0.5 rounded border border-subtle">Flowchart</span>
              </div>
            </div>

            {/* Interactive Demo Interface */}
            <div className="flex-1 flex flex-col md:flex-row relative">
              {/* Input section */}
              <div className="w-full md:w-80 bg-surface/50 border-r border-subtle p-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-text-muted block text-left">Diagram Generator Prompt</label>
                    <textarea 
                      value={demoPrompt}
                      onChange={(e) => setDemoPrompt(e.target.value)}
                      disabled={demoGenerating}
                      className="w-full min-h-24 p-2.5 rounded bg-bg-base border border-subtle focus:border-accent-primary text-xs text-text-primary outline-none resize-none font-sans"
                    />
                  </div>
                  <Button 
                    onClick={startDemoGeneration}
                    disabled={demoGenerating}
                    size="sm"
                    className="w-full bg-accent-primary hover:bg-accent-primary/95 text-white gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {demoGenerating ? "Modeling system..." : "Preview AI Generation"}
                  </Button>
                </div>
                <div className="text-[10px] text-text-muted border-t border-subtle/50 pt-3 text-left">
                  ⚡ Click the button to watch the AI build connections in real-time.
                </div>
              </div>

              {/* Viewport canvas */}
              <div className="flex-1 bg-bg-base bg-grid-pattern relative flex items-center justify-center p-6 min-h-[300px]">
                {demoStep === 0 && (
                  <div className="text-center space-y-2 pointer-events-none">
                    <Zap className="w-10 h-10 text-text-muted/40 mx-auto" />
                    <p className="text-xs text-text-muted">Enter a custom description and test the layout generation above.</p>
                  </div>
                )}
                {demoStep > 0 && (
                  <div className="relative w-full h-full flex items-center justify-center gap-6 md:gap-12 flex-col sm:flex-row">
                    {/* Node 1 */}
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="border border-accent-primary/40 bg-accent-primary/10 px-4 py-2.5 rounded shadow-lg text-xs font-semibold text-text-primary z-10"
                    >
                      User Signs Up
                    </motion.div>

                    {/* Node 2 */}
                    {demoStep >= 2 && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="border border-accent-cyan/40 bg-accent-cyan/10 px-4 py-2.5 rounded shadow-lg text-xs font-semibold text-text-primary z-10"
                      >
                        Database Verifies
                      </motion.div>
                    )}

                    {/* Node 3 */}
                    {demoStep >= 3 && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="border border-accent-green/40 bg-accent-green/10 px-4 py-2.5 rounded shadow-lg text-xs font-semibold text-text-primary z-10"
                      >
                        Dashboard Loads
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-subtle relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">Engineered for Technical Workflows</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">No generic diagrams. Get deterministic schemas, structured exports, and smart refactoring prompts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-subtle bg-surface/40 backdrop-blur-sm shadow-xl rounded-xl">
            <CardContent className="p-6 space-y-4 text-left">
              <div className="w-10 h-10 rounded bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
                <Cpu className="w-5 h-5 text-accent-primary" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Gemini 2.5 Modeling</h3>
              <p className="text-sm text-text-secondary">Converts complex descriptions into strict JSON. Automatically resolves and lays out entity relationships, interfaces, and flow decisions.</p>
            </CardContent>
          </Card>

          <Card className="border border-subtle bg-surface/40 backdrop-blur-sm shadow-xl rounded-xl">
            <CardContent className="p-6 space-y-4 text-left">
              <div className="w-10 h-10 rounded bg-accent-cyan/10 flex items-center justify-center border border-accent-cyan/20">
                <Layers className="w-5 h-5 text-accent-cyan" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">React Flow Editor</h3>
              <p className="text-sm text-text-secondary">Drag, connect, resize, and edit directly on an infinitely zoomable and pannable canvas. Full manual control overlaying the initial AI structures.</p>
            </CardContent>
          </Card>

          <Card className="border border-subtle bg-surface/40 backdrop-blur-sm shadow-xl rounded-xl">
            <CardContent className="p-6 space-y-4 text-left">
              <div className="w-10 h-10 rounded bg-accent-green/10 flex items-center justify-center border border-accent-green/20">
                <Download className="w-5 h-5 text-accent-green" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Multi-Format Exports</h3>
              <p className="text-sm text-text-secondary">Export immediately to production image assets (PNG, SVG, PDF) or structured code declarations (Mermaid, PlantUML, JSON data).</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="max-w-7xl mx-auto px-6 py-20 border-t border-subtle relative z-10 text-center">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">How Diagravix Works</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">From an idea in your head to a production-ready documentation asset in four clear steps.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div className="space-y-3 text-left">
            <div className="text-4xl font-black text-accent-primary/20">01</div>
            <h4 className="font-bold text-text-primary">Describe</h4>
            <p className="text-xs text-text-secondary">Provide plain text instructions outlining your sequence, flowchart steps, database schema, or architectural layers.</p>
          </div>

          <div className="space-y-3 text-left">
            <div className="text-4xl font-black text-accent-cyan/20">02</div>
            <h4 className="font-bold text-text-primary">Analyze & Generate</h4>
            <p className="text-xs text-text-secondary">Our AI service runs validations, structures nodes, calculates coordinates, and models the layout schema.</p>
          </div>

          <div className="space-y-3 text-left">
            <div className="text-4xl font-black text-accent-green/20">03</div>
            <h4 className="font-bold text-text-primary">Refine Manually</h4>
            <p className="text-xs text-text-secondary">Reposition components, edit connection labels, swap node shapes, or add custom notes on our canvas.</p>
          </div>

          <div className="space-y-3 text-left">
            <div className="text-4xl font-black text-accent-primary/20">04</div>
            <h4 className="font-bold text-text-primary">Sync & Export</h4>
            <p className="text-xs text-text-secondary">Save directly to your cloud dashboard or export code definitions (Mermaid/PlantUML) to commit straight to your Git docs.</p>
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section id="templates" className="max-w-7xl mx-auto px-6 py-20 border-t border-subtle relative z-10">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">Starter Templates</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">Select a type and begin sketching your layout immediately.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {["Flowcharts", "UML Class Diagrams", "Entity-Relationship", "Sequence Diagrams"].map((tpl, i) => (
            <Card key={i} className="border border-subtle bg-surface/30 hover:border-accent-primary/40 transition-all shadow-md group cursor-pointer">
              <CardContent className="p-5 space-y-3 text-left">
                <div className="h-32 rounded bg-bg-base border border-subtle flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-grid-pattern opacity-60" />
                  <span className="text-[11px] text-text-muted font-mono">Template #{i + 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary">{tpl}</span>
                  <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle bg-surface/20 py-12 relative z-10 text-xs text-text-muted">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent-primary rounded flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-text-primary">Diagravix AI</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Diagravix AI. Built with Gemini & React Flow.
          </div>
        </div>
      </footer>

      {/* Authentication Modal / Wizard */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="bg-surface border border-subtle text-primary max-w-md w-full p-6 shadow-2xl">
          
          {authMode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-text-primary">Welcome Back</DialogTitle>
                <DialogDescription className="text-text-secondary text-xs">
                  Enter your credentials to access your saved diagrams.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-text-secondary uppercase">Username or Email</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                    <Input 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="demo_user or demo@diagravix.ai"
                      className="pl-9 bg-bg-base border-subtle focus:border-accent-primary text-text-primary text-sm rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold text-text-secondary uppercase">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setAuthMode("forgot")}
                      className="text-[11px] text-accent-cyan hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                    <Input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 bg-bg-base border-subtle focus:border-accent-primary text-text-primary text-sm rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-accent-primary hover:bg-accent-primary/95 text-white font-medium py-2 rounded-lg mt-2"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </Button>

              <div className="text-center text-xs text-text-secondary pt-2">
                Don&apos;t have an account?{" "}
                <button 
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="text-accent-primary hover:underline font-semibold"
                >
                  Create one
                </button>
              </div>
            </form>
          )}

          {authMode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-text-primary">Create Account</DialogTitle>
                <DialogDescription className="text-text-secondary text-xs">
                  Save diagram models, collaborate, and export vectors.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-text-secondary uppercase">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                    <Input 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="developer_pro"
                      className="pl-9 bg-bg-base border-subtle focus:border-accent-primary text-text-primary text-sm rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-text-secondary uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                    <Input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="dev@company.com"
                      className="pl-9 bg-bg-base border-subtle focus:border-accent-primary text-text-primary text-sm rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-text-secondary uppercase">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                    <Input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 bg-bg-base border-subtle focus:border-accent-primary text-text-primary text-sm rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-accent-primary hover:bg-accent-primary/95 text-white font-medium py-2 rounded-lg mt-2"
              >
                {loading ? "Registering..." : "Create Account"}
              </Button>

              <div className="text-center text-xs text-text-secondary pt-2">
                Already registered?{" "}
                <button 
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="text-accent-primary hover:underline font-semibold"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {authMode === "forgot" && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => { setAuthMode("login"); setForgotStep("username"); }}
                    className="text-text-secondary hover:text-text-primary mr-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <DialogTitle className="text-xl font-bold text-text-primary">Reset Password</DialogTitle>
                </div>
                <DialogDescription className="text-text-secondary text-xs">
                  {forgotStep === "username" && "Enter your username to request an OTP code validation."}
                  {forgotStep === "otp" && "Enter the 6-digit OTP verification code sent to your user logs."}
                  {forgotStep === "reset" && "Enter and confirm your new password below."}
                </DialogDescription>
              </DialogHeader>

              {forgotStep === "username" && (
                <form onSubmit={handleForgotUsername} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-text-secondary uppercase">Your Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                      <Input 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="demo_user"
                        className="pl-9 bg-bg-base border-subtle focus:border-accent-primary text-text-primary text-sm rounded-lg"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-accent-primary hover:bg-accent-primary/95 text-white font-medium py-2 rounded-lg"
                  >
                    {loading ? "Verifying..." : "Send Verification Code"}
                  </Button>
                </form>
              )}

              {forgotStep === "otp" && (
                <form onSubmit={handleForgotOtp} className="space-y-4">
                  <div className="flex flex-col items-center space-y-4 py-2">
                    <label className="text-[11px] font-semibold text-text-secondary uppercase self-start">Verification Code (OTP)</label>
                    
                    <InputOTP maxLength={6} value={otpVal} onChange={setOtpVal}>
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={0} className="bg-bg-base border-subtle text-text-primary rounded-md text-lg" />
                        <InputOTPSlot index={1} className="bg-bg-base border-subtle text-text-primary rounded-md text-lg" />
                        <InputOTPSlot index={2} className="bg-bg-base border-subtle text-text-primary rounded-md text-lg" />
                        <InputOTPSlot index={3} className="bg-bg-base border-subtle text-text-primary rounded-md text-lg" />
                        <InputOTPSlot index={4} className="bg-bg-base border-subtle text-text-primary rounded-md text-lg" />
                        <InputOTPSlot index={5} className="bg-bg-base border-subtle text-text-primary rounded-md text-lg" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-text-muted">
                      {resetTimer > 0 ? `Resend in ${resetTimer}s` : "Code ready to resend"}
                    </span>
                    <button
                      type="button"
                      disabled={!resendActive}
                      onClick={async () => {
                        const success = await sendOtp(username)
                        if (success) {
                          toast.success("New code sent! Check your logs.")
                          setResetTimer(60)
                          setResendActive(false)
                          setOtpVal("")
                        }
                      }}
                      className={`font-semibold ${resendActive ? 'text-accent-primary hover:underline' : 'text-text-muted cursor-not-allowed'}`}
                    >
                      Resend Code
                    </button>
                  </div>

                  <Button 
                    type="submit"
                    disabled={otpVal.length < 6}
                    className="w-full bg-accent-primary hover:bg-accent-primary/95 text-white font-medium py-2 rounded-lg"
                  >
                    Verify Code
                  </Button>

                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-[11px] text-text-secondary text-left">
                    💡 <strong>Development Tip</strong>: The simulated verification code is <strong>123456</strong>. Check your console logs for confirmation.
                  </div>
                </form>
              )}

              {forgotStep === "reset" && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-text-secondary uppercase">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                        <Input 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-9 bg-bg-base border-subtle focus:border-accent-primary text-text-primary text-sm rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-text-secondary uppercase">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                        <Input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-9 bg-bg-base border-subtle focus:border-accent-primary text-text-primary text-sm rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-accent-cyan hover:bg-accent-cyan/95 text-bg-base font-semibold py-2 rounded-lg mt-2"
                  >
                    {loading ? "Resetting password..." : "Confirm Password Reset"}
                  </Button>
                </form>
              )}
            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  )
}
