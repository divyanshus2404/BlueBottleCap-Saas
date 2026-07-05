/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Removed the API proxy rewrite — Next.js API routes in /app/api are served
  // directly by the Next.js server. The previous rewrite to localhost:3001 was
  // routing ALL /api/* requests to an external server, which broke the built-in
  // App Router API routes entirely.
};

export default nextConfig;
