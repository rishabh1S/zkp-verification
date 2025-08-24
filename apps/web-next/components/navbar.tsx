"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-foreground">
                ZKVerify
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="#features"
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#use-cases"
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Use Cases
              </Link>
              <Button variant="outline" className="ml-4 bg-transparent">
                Verify Proof
              </Button>
              <Button className="ml-2">Get Started</Button>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-b border-border">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
            >
              How It Works
            </Link>
            <Link
              href="#use-cases"
              className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
            >
              Use Cases
            </Link>
            <div className="pt-4 pb-3 border-t border-border">
              <div className="flex items-center px-3 space-y-2 flex-col">
                <Button variant="outline" className="w-full bg-transparent">
                  Verify Proof
                </Button>
                <Button className="w-full">Get Started</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
