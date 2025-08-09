/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // 暂时忽略TypeScript错误
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
