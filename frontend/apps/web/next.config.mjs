/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.AMPLIFY_MONOREPO_APP_ROOT ? 'standalone' : undefined,
  transpilePackages: ["@workspace/ui"],
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: '/hubs/:path*',
        destination: `${apiUrl}/hubs/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
      },
    ]
  },
}

export default nextConfig
