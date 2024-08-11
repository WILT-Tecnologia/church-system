/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: true,
  reactStrictMode: true,
  experimental: { esmExternals: true, optimizeCss: true },
  output: "standalone",
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    customKey: "Church System",
    APP_ENV: process.env.APP_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    API_URL: process.env.API_URL,
    SERVER_API_URL: process.env.SERVER_API_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NO_SECRET: process.env.NO_SECRET,
  },
};

export default nextConfig;
