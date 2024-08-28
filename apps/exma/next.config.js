const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: true,
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      fs: false,
      path: false,
      os: false,
      net: false,
      tls: false,
    };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
    serverComponentsExternalPackages: [
      "bs58",
      "@solana/web3.js",
      "@metaplex-foundation/umi",
      "@metaplex-foundation/umi-serializers-encodings",
      "@metaplex-foundation/umi-bundle-defaults",
    ],
  },
};

module.exports = nextConfig;
