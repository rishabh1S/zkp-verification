import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import {
  Shield,
  Lock,
  Zap,
  ArrowRight,
  CheckCircle,
  Users,
  Globe,
  Smartphone,
  FileText,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Prove Your Eligibility{" "}
              <span className="text-primary">Without Revealing</span> Your
              Identity
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              ZKVerify uses zero-knowledge proofs to let you verify age, income,
              and other eligibility requirements without sharing sensitive
              personal information. Trusted by individuals and organizations
              worldwide.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/upload">
                  Get a Proof
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-transparent"
              >
                <Link href="/verify">Verify a Proof</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href="/issuer">Issuer Console</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Privacy-First Verification
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Secure, reusable proofs that protect your sensitive information
              while maintaining full verifiability
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary" />
                <CardTitle>Zero-Knowledge Proofs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Prove eligibility without revealing the underlying data. Your
                  personal information stays completely private and secure.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <Lock className="h-10 w-10 text-accent" />
                <CardTitle>Secure & Trusted</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Cryptographically secure proofs that can be verified on-chain
                  or off-chain with mathematical certainty and full trust.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <Zap className="h-10 w-10 text-primary" />
                <CardTitle>Reusable Proofs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate once, use everywhere. Share your proofs via QR codes,
                  secure links, or direct integration with services.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <Smartphone className="h-10 w-10 text-accent" />
                <CardTitle>Mobile Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access your proofs anywhere with our mobile-optimized
                  interface. Scan QR codes and verify instantly on any device.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How ZKVerify Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Simple, secure, and private verification in three easy steps
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">1. Upload Document</h3>
              <p className="mt-2 text-muted-foreground">
                Upload your official documents (ID, tax returns, bank
                statements) securely to our encrypted platform.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">2. Generate Proof</h3>
              <p className="mt-2 text-muted-foreground">
                Our zero-knowledge system creates a cryptographic proof of your
                eligibility without storing your data.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">3. Share & Verify</h3>
              <p className="mt-2 text-muted-foreground">
                Share your proof via QR code or link. Recipients can verify
                instantly without accessing your personal data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Perfect for Any Verification Need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From personal verification to enterprise compliance, ZKVerify
              scales to meet your needs
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                For Individuals
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>
                    Age verification for online services and platforms
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Income proof for loan applications and rentals</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>
                    Tax compliance verification for financial services
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Educational credentials for job applications</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Residency proof for government services</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-semibold flex items-center gap-2">
                <Globe className="h-6 w-6 text-accent" />
                For Organizations
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>KYC compliance without storing customer data</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>Regulatory compliance verification and auditing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>Employee eligibility screening and onboarding</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>Customer eligibility for financial products</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>Supply chain verification and transparency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of users who trust ZKVerify for their
              privacy-preserving verification needs. Start creating your first
              proof in minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/upload">
                  Create Your First Proof
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-transparent"
              >
                <Link href="/verify">Try Verification Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold">ZKVerify</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ZKVerify. Privacy-preserving eligibility proofs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
