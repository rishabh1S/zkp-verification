import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Mock authentication for development
        if (process.env.NEXT_PUBLIC_MOCK === "true") {
          // Mock issuer accounts
          const mockIssuers = [
            { id: "1", email: "admin@zkverify.com", password: "admin123", role: "admin" },
            { id: "2", email: "issuer@zkverify.com", password: "issuer123", role: "issuer" },
          ]

          const user = mockIssuers.find((u) => u.email === credentials.email && u.password === credentials.password)

          if (user) {
            return {
              id: user.id,
              email: user.email,
              role: user.role,
            }
          }
        }

        // In production, implement real authentication logic here
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/signup",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key",
  debug: process.env.NODE_ENV === "development",
}
