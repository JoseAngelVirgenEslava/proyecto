import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com'                   
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org'
      },
      {
        protocol: 'https',
        hostname: 'www.infodefensa.com'
      },
      {
        protocol: 'https',
        hostname: 'yaffa-cdn.s3.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'tanknutdave.com'
      }
    ]
  }
};

export default nextConfig;
