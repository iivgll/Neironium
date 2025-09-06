/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  // Убираем output: 'export' для поддержки API routes
  basePath: process.env.NODE_ENV === "production" ? "/Neironium" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/Neironium" : "",
  images: {
    domains: [
      "images.unsplash.com",
      "i.ibb.co",
      "scontent.fotp8-1.fna.fbcdn.net",
    ],
    unoptimized: true,
  },
  // Добавляем rewrites для обхода CORS
  async rewrites() {
    return [
      {
        source: "/api/web/v1/:path*",
        destination: "http://34.155.30.234/api/web/v1/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
