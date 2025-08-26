/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/Neironium' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Neironium' : '',
  images: {
    domains: [
      'images.unsplash.com',
      'i.ibb.co',
      'scontent.fotp8-1.fna.fbcdn.net',
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
