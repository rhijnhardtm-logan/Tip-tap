import Link from 'next/link'
import { ArrowRight, TrendingUp, Users, Zap } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">TipTap</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-foreground hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Get Tipped Digitally
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              TipTap makes it easy for service workers in South Africa to receive tips through modern payment methods. No hassle. No delays. Just instant payouts.
            </p>
            <div className="flex gap-4">
              <Link
                href="/register"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                Start Earning <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#features"
                className="border border-border px-6 py-3 rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 min-h-96 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-24 h-24 text-primary mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Your earnings, visualized</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Why Choose TipTap?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background border border-border rounded-xl p-6">
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Instant Payments</h3>
              <p className="text-muted-foreground">
                Receive tips instantly through Revolut, SnapScan, or Zapper
              </p>
            </div>
            <div className="bg-background border border-border rounded-xl p-6">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Simple Setup</h3>
              <p className="text-muted-foreground">
                Get started in minutes. No paperwork. No complicated processes.
              </p>
            </div>
            <div className="bg-background border border-border rounded-xl p-6">
              <TrendingUp className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Track Earnings</h3>
              <p className="text-muted-foreground">
                See your total tips, daily earnings, and manage settlements easily.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to start earning tips?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of South African service workers on TipTap
          </p>
          <Link
            href="/register"
            className="bg-primary-foreground text-primary px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-block"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">TipTap</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 TipTap. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
