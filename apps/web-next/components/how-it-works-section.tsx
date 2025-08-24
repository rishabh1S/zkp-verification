import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Cpu, QrCode, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload Document",
    description:
      "Securely upload your document (PDF, image) or connect your wallet. Our AI extracts relevant information.",
    step: "01",
  },
  {
    icon: Cpu,
    title: "Generate Proof",
    description: "Select what you want to prove (age, income, etc.). Our system creates a zero-knowledge proof.",
    step: "02",
  },
  {
    icon: QrCode,
    title: "Share Proof",
    description: "Get a QR code or shareable link. Your proof is ready to use across multiple platforms.",
    step: "03",
  },
  {
    icon: CheckCircle,
    title: "Instant Verification",
    description: "Verifiers can instantly confirm your eligibility without seeing your personal data.",
    step: "04",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, secure, and private. Get your eligibility proof in four easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="border-border hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 relative">
                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                      {step.step}
                    </div>
                    <div className="p-4 rounded-full bg-accent/10">
                      <step.icon className="h-8 w-8 text-accent" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed">{step.description}</CardDescription>
                </CardContent>
              </Card>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-border"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
