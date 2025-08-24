import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, RefreshCw, Link2, Eye, FileCheck, Zap } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Privacy Protection",
    description:
      "Your sensitive data never leaves your device. Prove eligibility without revealing personal information.",
    color: "text-primary",
  },
  {
    icon: RefreshCw,
    title: "Reusable Proofs",
    description: "Generate once, use everywhere. Your proofs work across multiple platforms and services.",
    color: "text-accent",
  },
  {
    icon: Link2,
    title: "On-Chain Verification",
    description: "Trustless verification powered by blockchain technology. No central authority needed.",
    color: "text-primary",
  },
  {
    icon: Eye,
    title: "Zero Knowledge",
    description: "Advanced cryptographic proofs that reveal nothing beyond the fact being proven.",
    color: "text-accent",
  },
  {
    icon: FileCheck,
    title: "Document Parsing",
    description: "AI-powered extraction from PDFs and images. Upload once, prove multiple claims.",
    color: "text-primary",
  },
  {
    icon: Zap,
    title: "Instant Verification",
    description: "Fast proof generation and verification. Get results in seconds, not hours.",
    color: "text-accent",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Why Choose ZKVerify?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with privacy, security, and user experience at the core. Experience the future of identity
            verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
