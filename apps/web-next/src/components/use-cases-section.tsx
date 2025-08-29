import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, GraduationCap, CreditCard, Home, Briefcase } from "lucide-react"

const individualUseCases = [
  {
    icon: GraduationCap,
    title: "Age Verification",
    description: "Prove you're over 18 for online services without sharing your birth date or ID.",
  },
  {
    icon: CreditCard,
    title: "Income Verification",
    description: "Demonstrate income eligibility for loans or services without revealing exact amounts.",
  },
  {
    icon: Home,
    title: "Residency Proof",
    description: "Confirm your location for local services while maintaining address privacy.",
  },
]

const organizationUseCases = [
  {
    icon: Building2,
    title: "KYC Compliance",
    description: "Streamline customer onboarding while maintaining regulatory compliance.",
  },
  {
    icon: Briefcase,
    title: "Employment Verification",
    description: "Verify candidate qualifications without accessing sensitive personal data.",
  },
  {
    icon: Users,
    title: "Access Control",
    description: "Grant access based on eligibility criteria without storing personal information.",
  },
]

export function UseCasesSection() {
  return (
    <section id="use-cases" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Use Cases</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            ZKVerify serves both individuals seeking privacy and organizations needing verification.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">For Individuals</h3>
            <div className="space-y-6">
              {individualUseCases.map((useCase, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <useCase.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{useCase.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{useCase.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">For Organizations</h3>
            <div className="space-y-6">
              {organizationUseCases.map((useCase, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <useCase.icon className="h-6 w-6 text-accent" />
                      </div>
                      <CardTitle className="text-xl">{useCase.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{useCase.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
