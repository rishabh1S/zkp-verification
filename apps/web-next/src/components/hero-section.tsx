import { Button } from "@/components/ui/button"
import { Shield, Lock, CheckCircle } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
              <div className="relative bg-primary/10 p-6 rounded-full">
                <Shield className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Prove Your Eligibility
            <span className="block text-primary">Without Revealing</span>
            <span className="block text-accent">Your Identity</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl mx-auto">
            Secure, private, and efficient proofs for age, income, and more using cutting-edge zero-knowledge
            technology. Your data stays yours while proving what matters.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" className="text-lg px-8 py-4">
              Get Your Proof
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent">
              Verify a Proof
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Privacy First</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span>Reusable Proofs</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>On-Chain Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
