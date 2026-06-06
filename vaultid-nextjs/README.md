# VaultID Authentication System

A production-ready, Next.js (App Router) authentication page with secure email/SMS OTP verification. Built with strict adherence to Next.js 14+ best practices, CSS Modules, native React state, and cryptographic security.

## Setup Instructions

1. **Install Dependencies**
   Install the required SDKs for sending emails and SMS:
   ```bash
   npm install resend twilio
   ```
   *(Note: These are lazy-loaded in the API routes, so they won't affect your client bundle size.)*

2. **Environment Variables**
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```
   *See the Environment Variables section below for details.*

3. **Copy Files**
   Move the generated files into your Next.js project structure:
   - `components/AuthPage.tsx` -> `components/AuthPage.tsx`
   - `components/AuthPage.module.css` -> `components/AuthPage.module.css`
   - `app/api/auth/send-otp/route.ts` -> `app/api/auth/send-otp/route.ts`
   - `app/api/auth/verify-otp/route.ts` -> `app/api/auth/verify-otp/route.ts`

## Environment Variables Guide

- `RESEND_API_KEY`: Get this from [Resend](https://resend.com/). Required for Email OTP.
- `TWILIO_ACCOUNT_SID`: Get this from your Twilio Console.
- `TWILIO_AUTH_TOKEN`: Get this from your Twilio Console.
- `TWILIO_PHONE_NUMBER`: Your purchased Twilio sender number (e.g., `+1234567890`).
- `OTP_SECRET`: A secure random string used to sign the session token cookies (e.g. `openssl rand -base64 32`).
- `NEXT_PUBLIC_APP_URL`: The base URL of your app (e.g., `http://localhost:3000`).

## Production Checklist

Before going live, ensure you have completed the following:

- [ ] **Verify Sender Domain**: Verify your sending domain on Resend so emails don't go to spam.
- [ ] **Replace In-Memory Map**: The current `send-otp` route uses a JS `Map` for storing OTPs, which resets on server restarts and doesn't share state across serverless instances. Replace it with [Upstash Redis](https://upstash.com/).
- [ ] **Implement Rate Limiting**: Add strict IP-based rate limiting using `@upstash/ratelimit` to prevent OTP SMS/Email bombing.
- [ ] **Upgrade Session Management**: The current implementation sets a basic HMAC-SHA256 cookie. For production, integrate [NextAuth.js v5](https://next-auth.js.org/) or [Iron Session](https://github.com/vvo/iron-session) using the `credentials` provider to handle session lifecycle and encryption.
- [ ] **SMS Alternatives (India)**: If you are sending SMS primarily to India (`+91`), Twilio is very expensive. Consider switching the Twilio logic to **MSG91** or **Fast2SMS** for significantly lower costs.
