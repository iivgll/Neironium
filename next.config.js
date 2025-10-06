/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      "images.unsplash.com",
      "i.ibb.co",
      "scontent.fotp8-1.fna.fbcdn.net",
    ],
    unoptimized: true,
  },
  // Добавляем rewrites для обхода CORS (работает в dev и production)
  async rewrites() {
    return [
      {
        source: "/api/web/v1/:path*",
        destination: "http://34.155.172.32/api/web/v1/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
