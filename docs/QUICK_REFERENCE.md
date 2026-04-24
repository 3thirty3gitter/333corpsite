# Quick Reference - Production Setup Commands

Essential commands for deploying and managing Pilot Suite in production.

## 🚀 Initial Setup (One-Time)

```bash
# 1. Install dependencies
npm ci

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Verify environment variables
./scripts/check-env.sh

# 4. Generate master admin secret
export MASTER_ADMIN_SECRET="$(openssl rand -hex 32)"
echo "Save this secret: $MASTER_ADMIN_SECRET"
```

## 📦 Database Setup

```bash
# Apply migrations to Supabase
./scripts/apply-migrations.sh

# Or manually via Supabase Dashboard → SQL Editor:
# - Run 001_create_pilot_test_table.sql
# - Run 002_create_employees_table.sql
# - Run 003_add_rls_policies.sql
```

## 🔐 Create Master Admin

```bash
# Local (with .env.local loaded)
export MASTER_ADMIN_SECRET="your-secret-from-env"
./scripts/create-master-admin.sh admin@3thirty3.com

# Production (pointing to Vercel)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app \
  MASTER_ADMIN_SECRET="your-secret" \
  ./scripts/create-master-admin.sh admin@3thirty3.com
```

## ☁️ Vercel Deployment

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Set environment variables (automated)
./scripts/setup-vercel-env.sh production

# Set environment variables (manual)
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add MASTER_ADMIN_SECRET production
vercel env add GEMINI_API_KEY production  # Optional
```

## 🧪 Testing Commands

```bash
# Local health check
curl http://localhost:3000/api/supabase/health

# Production health check
curl https://your-app.vercel.app/api/supabase/health

# Seed test data (local)
./scripts/seed-test.sh "test-name"

# Seed test data (production)
curl -X POST https://your-app.vercel.app/api/supabase/seed \
  -H 'Content-Type: application/json' \
  -d '{"name":"production-test"}'

# List test rows
curl https://your-app.vercel.app/api/supabase/pilot_test

# Clear test data (local)
./scripts/seed-test.sh --clear
```

## 🛠️ Development Commands

```bash
# Start dev server (port 9002)
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build

# Start production server locally
npm run start
```

## 📊 Monitoring & Logs

```bash
# View Vercel deployment logs
vercel logs [deployment-url]

# View recent production logs
vercel logs --prod

# Follow live logs
vercel logs --follow
```

## 🔄 Update & Redeploy

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm ci

# Run checks
npm run typecheck && npm run lint && npm run build

# Deploy to production
vercel --prod
```

## 🗄️ Database Management

```bash
# Connect to Supabase via psql
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[your-ref].supabase.co:5432/postgres"

# Backup database (via Supabase CLI)
supabase db dump -f backup.sql

# List all tables
psql -c "\dt" "your-connection-string"
```

## 🔧 Troubleshooting

```bash
# Check environment variables
./scripts/check-env.sh

# Verify Supabase connection (local)
curl http://localhost:3000/api/supabase/health

# Check if migrations were applied
# Go to Supabase Dashboard → Table Editor
# Should see: employees, pilot_test tables

# Reset local environment
rm -rf .next node_modules
npm ci
npm run dev

# Check Vercel deployment status
vercel list

# Rollback to previous deployment
vercel rollback [deployment-url]
```

## 📝 Common Environment Variable Patterns

**Local Development:**
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
MASTER_ADMIN_SECRET=your-32-char-hex-secret
GEMINI_API_KEY=AIza...  # Optional
```

**Production (Vercel):**
```bash
NEXT_PUBLIC_APP_URL=https://pilotsuite.com
# ... same Supabase credentials as local
# ... same secrets as local
```

## 🔗 Important URLs

- **Supabase Dashboard**: https://app.supabase.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/trenttimmerman/pilotsuite2025
- **Local Dev Server**: http://localhost:9002
- **Production App**: https://your-app.vercel.app

## 📚 Documentation Links

- [Production Setup Guide](./PRODUCTION_SETUP.md) - Full deployment guide
- [Production Checklist](./PRODUCTION_CHECKLIST.md) - Verification checklist
- [Auth Setup Checklist](../AUTH_SETUP_CHECKLIST.md) - Auth configuration
- [README](../README.md) - Project overview and quick start

---

**Pro Tip**: Bookmark this page for quick access to common commands!
