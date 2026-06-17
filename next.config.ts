import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: `output: "standalone"` is intentionally DISABLED.
  // Vercel's build system has its own serverless packaging and does NOT need
  // (and is confused by) Next.js standalone output. Enable it only if you're
  // self-hosting with `bun .next/standalone/server.js`.
  // output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  // Next.js 16 removed the `eslint` config key. Lint errors no longer fail
  // production builds by default; remove the deprecated key.
  reactStrictMode: false,
};

export default nextConfig;
