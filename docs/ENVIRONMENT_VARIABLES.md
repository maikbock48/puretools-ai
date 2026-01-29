# Environment Variables Documentation

Complete guide to configuring PureTools environment variables for development and production.

## Quick Start

```bash
# Copy example file
cp .env.example .env

# Fill in required values
nano .env
```

## Variable Reference

### 🔴 Required Variables

These must be set for the application to function:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `DATABASE_URL` | Database connection string | See Database section |
| `AUTH_SECRET` | NextAuth secret (32+ chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app URL | Your domain |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | Same as above |

### 🟡 Required for Features

| Variable | Feature | Where to Get |
|----------|---------|--------------|
| `GEMINI_API_KEY` | AI Summarizer, Translator | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `OPENAI_API_KEY` | Transcription, TTS, Images | [OpenAI Platform](https://platform.openai.com/api-keys) |
| `STRIPE_SECRET_KEY` | Credit purchases | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_PUBLISHABLE_KEY` | Payment UI | Same as above |
| `STRIPE_WEBHOOK_SECRET` | Payment webhooks | [Stripe Webhooks](https://dashboard.stripe.com/webhooks) |

### 🟢 Optional Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `GITHUB_CLIENT_ID` | GitHub login | N/A |
| `GITHUB_CLIENT_SECRET` | GitHub login | N/A |
| `RATE_LIMIT_AI_REQUESTS` | AI rate limit/min | 10 |
| `RATE_LIMIT_API_REQUESTS` | API rate limit/min | 60 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics | N/A |
| `SENTRY_DSN` | Error tracking | N/A |
| `RESEND_API_KEY` | Email sending | N/A |

---

## Detailed Configuration

### Database

**Development (SQLite):**
```bash
DATABASE_URL="file:./dev.db"
```

**Production (PostgreSQL):**
```bash
# Standard format
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

# With SSL (recommended)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public&sslmode=require"

# Supabase example
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"

# Neon example
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Authentication

**Generate AUTH_SECRET:**
```bash
# macOS/Linux
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**NEXTAUTH_URL:**
```bash
# Development
NEXTAUTH_URL="http://localhost:3000"

# Production
NEXTAUTH_URL="https://puretools.ai"
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "Google+ API" and "Google Identity"
4. Go to Credentials > Create Credentials > OAuth Client ID
5. Configure OAuth consent screen first if required
6. Select "Web application"
7. Add authorized JavaScript origins:
   - `http://localhost:3000` (dev)
   - `https://puretools.ai` (prod)
8. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://puretools.ai/api/auth/callback/google` (prod)

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: PureTools
   - Homepage URL: `https://puretools.ai`
   - Authorization callback URL: `https://puretools.ai/api/auth/callback/github`
4. Save Client ID and generate Client Secret

### AI API Keys

**Gemini (Google):**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Note: Free tier available with rate limits

**OpenAI:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key
3. Set up billing (required for production)
4. Recommended: Set usage limits

### Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard > Developers > API keys
3. For webhooks:
   - Go to Dashboard > Developers > Webhooks
   - Add endpoint: `https://puretools.ai/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy signing secret

**Test Mode vs Live Mode:**
```bash
# Test mode (sk_test_, pk_test_)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Live mode (sk_live_, pk_live_)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

### Sentry Error Tracking

1. Create account at [sentry.io](https://sentry.io)
2. Create new project (Next.js)
3. Copy DSN from project settings

```bash
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"

# For source maps (optional but recommended)
SENTRY_AUTH_TOKEN="sntrys_xxx"
SENTRY_ORG="your-org"
SENTRY_PROJECT="puretools"
```

### Rate Limiting

```bash
# Requests per minute per IP
RATE_LIMIT_AI_REQUESTS=10     # AI endpoints (expensive)
RATE_LIMIT_API_REQUESTS=60    # General API
```

---

## Environment-Specific Configurations

### Development (.env)

```bash
# Development configuration
NODE_ENV=development
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="dev-secret-change-in-production-32chars"

# Use test API keys
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Optional: Use free tier APIs
GEMINI_API_KEY=xxx
OPENAI_API_KEY=xxx

# OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

### Production (.env.production)

```bash
# Production configuration
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
NEXTAUTH_URL="https://puretools.ai"
NEXT_PUBLIC_APP_URL="https://puretools.ai"
AUTH_SECRET="generate-secure-32-char-secret"

# Live Stripe keys
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Production API keys
GEMINI_API_KEY=xxx
OPENAI_API_KEY=xxx

# OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# Monitoring
SENTRY_DSN=xxx
NEXT_PUBLIC_SENTRY_DSN=xxx
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-xxx

# Email
RESEND_API_KEY=re_xxx
```

### Vercel Deployment

Set these in Vercel Dashboard > Project > Settings > Environment Variables:

| Variable | Environment |
|----------|-------------|
| `DATABASE_URL` | Production |
| `AUTH_SECRET` | Production |
| `NEXTAUTH_URL` | Production |
| All API keys | Production |

**Important:** Mark sensitive variables as "Sensitive" to hide them in logs.

### Docker Deployment

```yaml
# docker-compose.yml
services:
  app:
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://puretools:${DB_PASSWORD}@db:5432/puretools
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXTAUTH_URL=${APP_URL}
      # ... other variables from .env.production
```

---

## Security Best Practices

### ✅ Do:
- Use different keys for dev/staging/production
- Rotate API keys periodically
- Set usage limits on OpenAI
- Use environment-specific Stripe keys
- Store secrets in secure vault (1Password, Vault, etc.)
- Use Vercel's encrypted environment variables

### ❌ Don't:
- Commit .env files to git
- Share API keys in logs or error messages
- Use production keys in development
- Expose STRIPE_SECRET_KEY to client

### Key Rotation

When rotating keys:

1. Generate new key in provider dashboard
2. Update in deployment environment
3. Deploy and verify
4. Revoke old key in provider dashboard

---

## Troubleshooting

### "Invalid API key"
- Verify key is copied correctly (no trailing spaces)
- Check key matches environment (test vs live)
- Ensure billing is set up (OpenAI)

### "Database connection failed"
- Verify DATABASE_URL format
- Check network access (firewall, IP allowlist)
- Verify SSL settings match server

### "OAuth callback error"
- Verify callback URLs match exactly
- Check NEXTAUTH_URL matches your domain
- Ensure OAuth app is not in "testing" mode

### "Webhook signature verification failed"
- Use correct webhook secret (not API key)
- Ensure raw body parsing for webhook route
- Check timestamp isn't too old

---

## Required Variables Checklist

Before going to production, ensure these are set:

- [ ] `DATABASE_URL` (PostgreSQL)
- [ ] `AUTH_SECRET` (secure, 32+ chars)
- [ ] `NEXTAUTH_URL` (your domain)
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- [ ] `OPENAI_API_KEY` (with billing)
- [ ] `GEMINI_API_KEY`
- [ ] `STRIPE_SECRET_KEY` (live mode)
- [ ] `STRIPE_PUBLISHABLE_KEY` (live mode)
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `SENTRY_DSN` (recommended)
