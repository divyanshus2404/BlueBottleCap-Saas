import { withSentryConfig } from "@sentry/nextjs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Pin the Turbopack workspace root to this project. A stray
  // package-lock.json in a parent dir (~/) otherwise makes Next infer the
  // wrong root, which crashes Turbopack with a PoisonError panic on dev.
  turbopack: { root: __dirname },
  // Note: no API proxy rewrite — Next.js API routes in /app/api are served
  // directly. A previous rewrite to localhost:3001 broke the built-in App
  // Router routes and has been removed.
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  disableLogger: true,
  autoInstrumentServerFunctions: false,
  autoInstrumentMiddleware: false,
});
