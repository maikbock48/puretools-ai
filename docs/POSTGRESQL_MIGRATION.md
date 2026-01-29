# PostgreSQL Migration Guide

This guide explains how to migrate PureTools from SQLite (development) to PostgreSQL (production).

## Prerequisites

1. PostgreSQL 14+ installed or a managed PostgreSQL service (e.g., Supabase, Neon, Railway, AWS RDS)
2. Access to production server/environment

## Step 1: Set Up PostgreSQL Database

### Option A: Managed Service (Recommended)

**Supabase (Free tier available):**
1. Create account at supabase.com
2. Create new project
3. Go to Settings > Database > Connection string
4. Copy the "URI" connection string

**Neon (Free tier available):**
1. Create account at neon.tech
2. Create new project
3. Copy the connection string from dashboard

**Railway:**
1. Create account at railway.app
2. Add PostgreSQL plugin
3. Copy DATABASE_URL from variables

### Option B: Self-Hosted

```bash
# Install PostgreSQL
brew install postgresql@14  # macOS
# or
sudo apt install postgresql-14  # Ubuntu

# Create database
createdb puretools_production

# Create user
createuser -P puretools_user
# Enter password when prompted

# Grant privileges
psql -c "GRANT ALL PRIVILEGES ON DATABASE puretools_production TO puretools_user;"
```

## Step 2: Update Environment Variables

```bash
# Production .env
DATABASE_URL="postgresql://puretools_user:YOUR_PASSWORD@localhost:5432/puretools_production?schema=public"

# Or for managed services (example Supabase):
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
```

## Step 3: Switch to PostgreSQL Schema

```bash
# Backup current SQLite data (if needed)
cp prisma/dev.db prisma/dev.db.backup

# Replace schema.prisma with PostgreSQL version
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

## Step 4: Generate and Apply Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# For production (without interactive prompts)
npx prisma migrate deploy
```

## Step 5: Data Migration (Optional)

If you have existing data in SQLite that needs to be migrated:

```bash
# Export SQLite data
sqlite3 prisma/dev.db ".dump" > backup.sql

# Or use a migration script
node scripts/migrate-sqlite-to-postgres.js
```

### Sample Migration Script

Create `scripts/migrate-sqlite-to-postgres.js`:

```javascript
const { PrismaClient: SqliteClient } = require('@prisma/client');
const { Pool } = require('pg');

async function migrate() {
  // Configure based on your setup
  const sqliteDb = new SqliteClient({
    datasources: { db: { url: 'file:./prisma/dev.db' } }
  });

  const pgPool = new Pool({
    connectionString: process.env.POSTGRES_URL
  });

  try {
    // Migrate users
    const users = await sqliteDb.user.findMany();
    for (const user of users) {
      await pgPool.query(
        `INSERT INTO "User" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", credits, "referralCode")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.name, user.email, user.emailVerified, user.image, user.createdAt, user.updatedAt, user.credits, user.referralCode]
      );
    }
    console.log(`Migrated ${users.length} users`);

    // Add similar blocks for other tables...

  } finally {
    await sqliteDb.$disconnect();
    await pgPool.end();
  }
}

migrate().catch(console.error);
```

## Step 6: Verify Migration

```bash
# Connect to PostgreSQL and verify
npx prisma studio

# Or via psql
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"
```

## Step 7: Update Deployment

### Vercel

1. Go to Project Settings > Environment Variables
2. Update `DATABASE_URL` with PostgreSQL connection string
3. Redeploy

### Docker

Update `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: puretools
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: puretools
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://puretools:${DB_PASSWORD}@db:5432/puretools
    depends_on:
      - db

volumes:
  postgres_data:
```

## Schema Differences

The PostgreSQL schema includes these optimizations:

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Text fields | `String` | `String @db.Text` (for large text) |
| Token storage | Limited | Full `@db.Text` for OAuth tokens |
| Indexes | Basic | Composite indexes for common queries |
| Connection pooling | N/A | Built-in via PgBouncer or Prisma |

## Connection Pooling (Production)

For high-traffic production, use connection pooling:

### Prisma Data Proxy

```bash
# Install
npm install @prisma/client@latest

# Update schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // For migrations
}
```

### PgBouncer (Self-hosted)

```ini
# pgbouncer.ini
[databases]
puretools = host=localhost dbname=puretools_production

[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

## Troubleshooting

### Error: "prepared statement already exists"

Add `?pgbouncer=true` to your connection string when using PgBouncer.

### Error: "too many connections"

1. Reduce `connection_limit` in Prisma
2. Use connection pooling
3. Ensure proper `$disconnect()` calls

### Slow queries

1. Run `ANALYZE` on tables
2. Check indexes with `EXPLAIN ANALYZE`
3. Add missing indexes to schema

## Rollback Plan

If migration fails:

```bash
# Revert to SQLite schema
git checkout prisma/schema.prisma

# Regenerate client
npx prisma generate

# Restore backup
cp prisma/dev.db.backup prisma/dev.db
```

## Performance Checklist

- [ ] Connection pooling enabled
- [ ] Indexes created for common queries
- [ ] `ANALYZE` run after bulk imports
- [ ] SSL enabled for remote connections
- [ ] Backups configured (pg_dump or managed service)
- [ ] Monitoring set up (query performance)
