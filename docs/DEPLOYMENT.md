# PureTools AI - Deployment Guide

Complete guide for deploying PureTools to production.

## Deployment Options

| Option | Best For | Complexity | Cost |
|--------|----------|------------|------|
| **Vercel** | Quick setup, auto-scaling | Low | Free-$20+/mo |
| **Docker + VPS** | Full control, custom setup | Medium | $5-50/mo |
| **Railway** | Simple container hosting | Low | $5-20/mo |

---

## Option 1: Vercel (Recommended)

### Prerequisites
- GitHub/GitLab account
- Vercel account (free tier available)
- PostgreSQL database (Supabase, Neon, or Railway)

### Step-by-Step

1. **Connect Repository**
   ```bash
   # Push to GitHub if not already
   git remote add origin https://github.com/yourusername/puretools.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - Configure project settings

3. **Set Environment Variables**

   In Vercel Dashboard > Project > Settings > Environment Variables:

   ```
   DATABASE_URL=postgresql://...
   AUTH_SECRET=your-secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   OPENAI_API_KEY=...
   GEMINI_API_KEY=...
   STRIPE_SECRET_KEY=...
   STRIPE_PUBLISHABLE_KEY=...
   STRIPE_WEBHOOK_SECRET=...
   ```

4. **Configure Database**

   Using Supabase (recommended):
   ```bash
   # Get connection string from Supabase dashboard
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
   ```

5. **Run Database Migration**
   ```bash
   # Local (with production DATABASE_URL)
   npx prisma migrate deploy
   ```

6. **Deploy**
   - Vercel auto-deploys on push to main
   - Or manually: `vercel --prod`

7. **Configure Domain**
   - Go to Project > Settings > Domains
   - Add your domain
   - Update DNS records as shown

8. **Set Up Stripe Webhook**
   - Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Vercel-Specific Features

```json
// vercel.json is already configured with:
- Security headers
- Static asset caching
- API no-cache
- Region: Frankfurt (fra1)
```

---

## Option 2: Docker + VPS

### Prerequisites
- VPS with Docker installed (DigitalOcean, Hetzner, etc.)
- Domain name
- SSL certificates (Let's Encrypt)

### Step-by-Step

1. **Prepare Server**
   ```bash
   # SSH into server
   ssh user@your-server-ip

   # Install Docker
   curl -fsSL https://get.docker.com | sh

   # Install Docker Compose
   sudo apt install docker-compose-plugin

   # Create app directory
   mkdir -p /opt/puretools
   cd /opt/puretools
   ```

2. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/puretools.git .
   ```

3. **Create Environment File**
   ```bash
   cat > .env << 'EOF'
   # Database
   DB_USER=puretools
   DB_PASSWORD=your-secure-password
   DB_NAME=puretools

   # App
   APP_URL=https://puretools.ai
   AUTH_SECRET=your-32-char-secret

   # OAuth
   GOOGLE_CLIENT_ID=xxx
   GOOGLE_CLIENT_SECRET=xxx

   # AI
   OPENAI_API_KEY=xxx
   GEMINI_API_KEY=xxx

   # Stripe
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx

   # Monitoring (optional)
   SENTRY_DSN=xxx
   GA_MEASUREMENT_ID=G-xxx
   EOF
   ```

4. **Set Up SSL (Let's Encrypt)**
   ```bash
   # Install certbot
   sudo apt install certbot

   # Get certificates
   sudo certbot certonly --standalone -d puretools.ai -d www.puretools.ai

   # Copy to project
   mkdir -p certs
   sudo cp /etc/letsencrypt/live/puretools.ai/fullchain.pem certs/
   sudo cp /etc/letsencrypt/live/puretools.ai/privkey.pem certs/
   sudo chown -R $USER:$USER certs/
   ```

5. **Build and Start**
   ```bash
   # Build image
   docker compose build

   # Start services
   docker compose up -d

   # Run migrations
   docker compose exec app npx prisma migrate deploy

   # Check logs
   docker compose logs -f app
   ```

6. **With Nginx (recommended)**
   ```bash
   # Start with nginx profile
   docker compose --profile with-nginx up -d
   ```

### Docker Commands Reference

```bash
# View logs
docker compose logs -f app

# Restart app
docker compose restart app

# Update deployment
git pull
docker compose build app
docker compose up -d app

# Database backup
docker compose exec db pg_dump -U puretools puretools > backup.sql

# Enter container shell
docker compose exec app sh
```

### Automatic SSL Renewal

```bash
# Create renewal script
cat > /etc/cron.d/certbot-renew << 'EOF'
0 0 1 * * root certbot renew --quiet && docker compose -f /opt/puretools/docker-compose.yml restart nginx
EOF
```

---

## Option 3: Railway

### Step-by-Step

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Connect GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL**
   - Click "New" > "Database" > "PostgreSQL"
   - Railway auto-generates `DATABASE_URL`

4. **Configure Variables**
   - Go to your service > Variables
   - Add all required environment variables
   - Reference database: `${{Postgres.DATABASE_URL}}`

5. **Deploy**
   - Railway auto-deploys on push
   - Check deployment logs

---

## Post-Deployment Checklist

### Security
- [ ] All environment variables set correctly
- [ ] HTTPS enabled
- [ ] Stripe webhook secret configured
- [ ] OAuth callback URLs updated
- [ ] Rate limiting working

### Functionality
- [ ] Homepage loads
- [ ] User can sign in with Google
- [ ] AI tools work (test with small request)
- [ ] Credit purchase works (use Stripe test mode first)
- [ ] Stripe webhook receives events

### Monitoring
- [ ] Sentry capturing errors
- [ ] Google Analytics tracking
- [ ] Health endpoint responding: `/api/health`

### Performance
- [ ] Static assets cached
- [ ] Images optimized
- [ ] Database queries performant

---

## Monitoring & Maintenance

### Health Check

```bash
# Check health endpoint
curl https://puretools.ai/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-01-22T...",
  "checks": {
    "database": "connected",
    "server": "running"
  }
}
```

### Log Monitoring

**Vercel:**
- Dashboard > Project > Logs
- Runtime Logs for errors

**Docker:**
```bash
# All logs
docker compose logs -f

# App only
docker compose logs -f app

# Last 100 lines
docker compose logs --tail=100 app
```

### Database Backup

```bash
# Manual backup
docker compose exec db pg_dump -U puretools puretools > backup_$(date +%Y%m%d).sql

# Automated daily backup (cron)
0 2 * * * docker compose -f /opt/puretools/docker-compose.yml exec -T db pg_dump -U puretools puretools > /backups/puretools_$(date +\%Y\%m\%d).sql
```

### Updating

```bash
# Pull latest changes
git pull origin main

# Vercel: Auto-deploys

# Docker:
docker compose build app
docker compose up -d app
docker compose exec app npx prisma migrate deploy
```

---

## Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` format
- Verify database is running
- Check firewall/security groups

### "OAuth callback error"
- Verify `NEXTAUTH_URL` matches your domain exactly
- Check OAuth app callback URLs in Google/GitHub console
- Ensure HTTPS is working

### "Stripe webhook failed"
- Verify webhook secret is correct
- Check endpoint URL is accessible
- Review Stripe webhook logs

### "Build failed on Vercel"
- Check build logs for errors
- Verify all environment variables are set
- Run `npm run build` locally to test

### Container keeps restarting
```bash
# Check logs
docker compose logs app

# Common issues:
# - Missing environment variables
# - Database not ready (check depends_on)
# - Port already in use
```

---

## Scaling

### Vercel
- Auto-scales based on traffic
- Upgrade plan for more resources

### Docker
```yaml
# docker-compose.yml - scale app
services:
  app:
    deploy:
      replicas: 3

# Use with load balancer
docker compose up -d --scale app=3
```

### Database
- Use connection pooling (PgBouncer)
- Consider read replicas for heavy read loads
- Monitor with pg_stat_statements
