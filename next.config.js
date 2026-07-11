import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
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
