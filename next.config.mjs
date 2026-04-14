import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // Disables PWA caching in dev mode to prevent caching issues while coding
  disable: process.env.NODE_ENV === "development", 
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silences the Next.js 16 Turbopack + Webpack plugin conflict error
  turbopack: {}, 
  
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', 
      },
    ],
  },
};

export default withPWA(nextConfig);