'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp, Users, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const processSteps = [
  {
    number: 1,
    title: 'Create Account',
    description: 'Sign up instantly with your email',
    image: '/images/step-1-create-account.png',
  },
  {
    number: 2,
    title: 'Set Up Wallet',
    description: 'Choose your payment method',
    image: '/images/step-2-setup-wallet.png',
  },
  {
    number: 3,
    title: 'Work & Get Tips',
    description: 'Tips arrive instantly',
    image: '/images/step-3-work-get-tips.png',
  },
  {
    number: 4,
    title: 'Get Cash',
    description: 'Direct to your wallet',
    image: '/images/step-4-get-cash.png',
  },
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % processSteps.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlay(false)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % processSteps.length)
    setIsAutoPlay(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + processSteps.length) % processSteps.length)
    setIsAutoPlay(false)
  }

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
              href="/login-mock"
              className="text-foreground hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register-mock"
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
                href="/register-mock"
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
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 flex items-center justify-center">
            <div className="w-full">
              <h3 className="text-2xl font-bold text-foreground text-center mb-8">How TipTap Works</h3>
              
              {/* Carousel Container */}
              <div className="relative">
                {/* Slides */}
                <div className="relative overflow-hidden rounded-xl bg-background border border-border">
                  <div className="relative h-96 md:h-[450px]">
                    {processSteps.map((step, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                          index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <Image
                          src={step.image}
                          alt={step.title}
                          fill
                          className="object-cover"
                        />
                        {/* Content Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                          <div className="text-white">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-lg">
                                {step.number}
                              </div>
                              <h4 className="text-2xl font-bold">{step.title}</h4>
                            </div>
                            <p className="text-white/90">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-6 h-6 text-foreground" />
                  </button>
                </div>

                {/* Dots Navigation */}
                <div className="flex justify-center gap-2 mt-6">
                  {processSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentSlide
                          ? 'bg-primary w-8'
                          : 'bg-border hover:bg-muted-foreground'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Step Details */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {processSteps.map((step, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg transition-colors ${
                        index === currentSlide
                          ? 'bg-primary/10 border border-primary'
                          : 'bg-transparent'
                      }`}
                    >
                      <p className="text-xs text-muted-foreground mb-1">{step.title}</p>
                      <p className="text-xs font-medium text-foreground">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-foreground text-center mb-12">Choose Your Authentication</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-accent/20 rounded-lg p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-accent" />
                <h3 className="text-2xl font-bold text-foreground">Mock Mode</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Perfect for testing and exploring TipTap without any setup. All data is stored locally in your browser.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-8">
                <li>✓ No Supabase required</li>
                <li>✓ Instant setup</li>
                <li>✓ Local browser storage</li>
                <li>✓ Full feature testing</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/register-mock"
                className="bg-accent text-accent-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-center font-medium"
              >
                Get Started (Mock)
              </Link>
              <Link
                href="/login-mock"
                className="border border-accent text-accent px-6 py-2 rounded-lg hover:bg-accent/5 transition-colors text-center"
              >
                Sign In (Mock)
              </Link>
            </div>
          </div>

          <div className="border border-primary/20 rounded-lg p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">Create Account</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Set up your TipTap account to start receiving tips securely and get paid directly to your wallet.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-8">
                <li>✓ Secure payment handling</li>
                <li>✓ Multiple payment methods</li>
                <li>✓ Track all your earnings</li>
                <li>✓ Fast payouts to your wallet</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/register"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-center font-medium"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="border border-primary text-primary px-6 py-2 rounded-lg hover:bg-primary/5 transition-colors text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to start earning tips?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of South African service workers on TipTap
          </p>
          <Link
            href="/register-mock"
            className="bg-primary-foreground text-primary px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-block"
          >
            Try Now (Mock)
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
