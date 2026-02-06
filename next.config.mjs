/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore ESLint errors during build (e.g., unused imports)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors if any
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure Firebase images (if any) are allowed
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all external images for now
      },
    ],
  },
};

export default nextConfig;
