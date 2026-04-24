import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Momentec image CDN domains
      {
        protocol: 'https',
        hostname: '*.momentecbrands.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.momentecbrands.ca',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'momentecbrands.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'momentecbrands.ca',
        port: '',
        pathname: '/**',
      },
      // Common CDN patterns for product images
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      // SinaLite image domains
      {
        protocol: 'https',
        hostname: '*.sinalite.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sinalite.com',
        port: '',
        pathname: '/**',
      },
      // Momentec static image servers
      {
        protocol: 'https',
        hostname: 'static.momentecbrands.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.augustasportswear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.augustasportswear.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
