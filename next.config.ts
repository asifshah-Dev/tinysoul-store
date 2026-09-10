/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tinysoul.pk',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.tinysoul.pk',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;