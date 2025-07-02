/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['archiver'],
  },
  // Enable streaming for Server-Sent Events
  async headers() {
    return [
      {
        source: '/api/ask',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Connection',
            value: 'keep-alive',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig 