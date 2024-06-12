/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: true,
  reactStrictMode: true,
  experimental: { esmExternals: true },
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
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_URL_INTERNAL,
    DATABASE_URL: process.env.DATABASE_URL,
    API_URL: process.env.API_URL,
    SERVER_API_URL: process.env.SERVER_API_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    CLIENT_FETCH_ERROR: process.env.CLIENT_FETCH_ERROR,
    JWT_SIGNING_PRIVATE_KEY: process.env.JWT_SIGNING_PRIVATE_KEY,
  },
};

export default nextConfig;
