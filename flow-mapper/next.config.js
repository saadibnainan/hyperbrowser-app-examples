/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SITE_DOMAIN: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'http://localhost:3000',
  },
  experimental: {
    serverComponentsExternalPackages: ['archiver'],
  },
}

module.exports = nextConfig 