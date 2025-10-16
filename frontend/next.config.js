/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['react-icons', 'lucide-react']
  },
  // Enable compression
  compress: true,
  // Optimize bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  // Suppress specific warnings in development
  onDemandEntries: {
    // Suppress bbai-tooltip-injected warnings
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  }
}

module.exports = nextConfig
