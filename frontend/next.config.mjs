/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Strict Mode 비활성화
  experimental: {
    forceSwcTransforms: true, // Fast Refresh 관련 문제 해결
  },
};

export default nextConfig;
