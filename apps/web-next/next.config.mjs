/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost"],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_MOCK: process.env.NEXT_PUBLIC_MOCK || "true",
    NEXT_PUBLIC_API_PARSER:
      process.env.NEXT_PUBLIC_API_PARSER || "http://localhost:8080",
    NEXT_PUBLIC_API_ORCHESTRATOR:
      process.env.NEXT_PUBLIC_API_ORCHESTRATOR || "http://localhost:8000",
  },
};

export default nextConfig;
