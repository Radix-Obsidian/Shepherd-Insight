/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false
    } else {
      // Use graceful-fs for server-side file operations
      config.resolve.alias.fs = require.resolve('graceful-fs')
    }
    return config
  },
}

module.exports = nextConfig
