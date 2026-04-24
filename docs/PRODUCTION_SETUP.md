# Production Deployment Guide

Complete guide for deploying Pilot Suite to production with Supabase and Vercel.

## Prerequisites

- [ ] Node.js 20+ installed
- [ ] Vercel account (https://vercel.com)
- [ ] Supabase account (https://supabase.com)
- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Git repository pushed to GitHub

---

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com/
2. Click **"New Project"**
3. Choose organization and provide:
   - **Project name**: `pilotsuite2025-prod`
   - **Database password**: (generate a strong password, save it securely)
   - **Region**: Choose closest to your users
4. Wait for project to be created (~2 minutes)

---

## Step 2: Get Supabase Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (this is safe to expose)
   - **service_role key**: `eyJhbGc...` (keep this SECRET!)

---

## Step 3: Configure Local Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your values:
   ```bash
   # Application URL (use localhost for local dev)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Supabase credentials from Step 2
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   
   # Generate a secure master admin secret
   MASTER_ADMIN_SECRET=$(openssl rand -hex 32)
   
   # Optional: Google AI for product suggestions
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. Save the file

---

## Step 4: Apply Database Migrations

Run the migrations to create the required tables:

```bash
# Option 1: Using the helper script (requires Supabase CLI)
./scripts/apply-migrations.sh

# Option 2: Manual via Supabase Dashboard
# Go to SQL Editor in your Supabase dashboard and run each file:
# - supabase/migrations/001_create_pilot_test_table.sql
# - supabase/migrations/002_create_employees_table.sql
# - supabase/migrations/003_add_rls_policies.sql
```

**Verify**: Go to **Table Editor** in Supabase Dashboard and confirm `employees` and `pilot_test` tables exist.

---

## Step 5: Configure Supabase Authentication

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set the following:
   - **Site URL**: `https://your-app.vercel.app` (you'll get this after Vercel deployment)
   - **Redirect URLs**: Add these patterns:
     - `http://localhost:3000/**`
     - `https://your-app.vercel.app/**`
     - `https://*.vercel.app/**` (for preview deployments)

3. Go to **Authentication** → **Email Templates** and customize if needed

4. (Optional) Configure **SMTP Settings** for custom email delivery:
   - Go to **Authentication** → **Email** → **SMTP Settings**
   - Add your SMTP provider details

---

## Step 6: Deploy to Vercel

### 6.1 Initial Deployment

```bash
# Login to Vercel
vercel login

# Deploy (this creates the project)
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? pilotsuite2025
# - Directory? ./
# - Override settings? No
```

After deployment, Vercel will give you a URL like: `https://pilotsuite2025-xxxxx.vercel.app`

### 6.2 Set Environment Variables

**Option A: Using the helper script (recommended)**

```bash
# Update NEXT_PUBLIC_APP_URL in .env.local with your Vercel URL
# Then run:
./scripts/setup-vercel-env.sh production
```

**Option B: Manual via Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Select your project → **Settings** → **Environment Variables**
3. Add each variable for **Production** environment:
   - `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `MASTER_ADMIN_SECRET`
   - `GEMINI_API_KEY` (optional)

**Option C: Using Vercel CLI**

```bash
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://your-app.vercel.app

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter your Supabase URL

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter your anon key

vercel env add SUPABASE_URL production
# Enter your Supabase URL

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Enter your service role key

vercel env add MASTER_ADMIN_SECRET production
# Enter your master admin secret

vercel env add GEMINI_API_KEY production
# Enter your Gemini API key (optional)
```

### 6.3 Redeploy with Environment Variables

```bash
vercel --prod
```

---

## Step 7: Update Supabase Auth URLs

Now that you have your production URL:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Update:
   - **Site URL**: `https://your-actual-app.vercel.app`
   - **Redirect URLs**: Ensure your production domain is included

---

## Step 8: Create Master Admin Account

```bash
# Set your master admin secret (same as in .env.local)
export MASTER_ADMIN_SECRET="your-secret-from-env"

# Run the script with your admin email
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app \
  ./scripts/create-master-admin.sh admin@3thirty3.com
```

This creates the first admin user who can invite other team members.

---

## Step 9: Test Your Production Deployment

### Health Check
```bash
curl https://your-app.vercel.app/api/supabase/health
# Expected: {"connected":true,"message":"Supabase admin client initialized"}
```

### Test Database Write
```bash
curl -X POST https://your-app.vercel.app/api/supabase/seed \
  -H 'Content-Type: application/json' \
  -d '{"name":"production-test"}'
# Expected: {"success":true,"rows":[...]}
```

### Sign In
1. Visit: `https://your-app.vercel.app/auth/signin`
2. Enter your admin email
3. Click "Sign In" (password) or use magic link
4. Check email for magic link if using that method
5. Access dashboard at: `https://your-app.vercel.app/dashboard`

---

## Step 10: Configure Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `pilotsuite.com`)
4. Follow DNS configuration instructions
5. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables to your custom domain
6. Update Supabase Auth URLs to include your custom domain

---

## Production Checklist

- [ ] Supabase project created and configured
- [ ] Database migrations applied successfully
- [ ] Row Level Security (RLS) policies enabled
- [ ] Supabase Auth URLs configured correctly
- [ ] Vercel project deployed
- [ ] All environment variables set in Vercel
- [ ] Master admin account created
- [ ] Health check endpoint responding
- [ ] Sign-in flow working (magic link or password)
- [ ] Dashboard accessible for admin users
- [ ] Team invite functionality working
- [ ] SMTP configured (optional, for custom emails)
- [ ] Custom domain configured (optional)

---

## Troubleshooting

### "Supabase not configured" error
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel
- Redeploy after setting environment variables

### Magic link not working
- Check Supabase Auth → URL Configuration
- Ensure your app URL is in the redirect URLs list
- Check spam folder for email

### "unauthorized" when accessing admin pages
- Ensure your email ends with `@3thirty3.com`
- Or update the admin check logic in code

### Database connection fails
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check Supabase project is not paused (free tier projects pause after inactivity)

### Master admin creation fails
- Verify `MASTER_ADMIN_SECRET` matches in both .env.local and Vercel
- Check that migrations were applied successfully

---

## Monitoring & Maintenance

### Supabase Dashboard
- Monitor database usage: https://app.supabase.com/ → Your Project → **Database**
- View auth users: **Authentication** → **Users**
- Check logs: **Logs** section

### Vercel Dashboard
- Monitor deployments: https://vercel.com/dashboard → Your Project → **Deployments**
- View runtime logs: Click any deployment → **Logs**
- Check analytics: **Analytics** tab

---

## Security Best Practices

1. **Never commit secrets to git**
   - `.env.local` is in `.gitignore`
   - Use environment variables for all secrets

2. **Rotate secrets regularly**
   - `MASTER_ADMIN_SECRET` should be rotated after initial setup
   - Consider using Vercel's secret rotation features

3. **Enable Row Level Security**
   - Already done via migration `003_add_rls_policies.sql`
   - Review policies regularly

4. **Use HTTPS only**
   - Vercel provides this automatically
   - Never disable HTTPS redirects

5. **Limit admin access**
   - Currently gated by `@3thirty3.com` domain
   - Consider moving to database role-based checks

---

## Next Steps

Once production is stable:
1. Set up monitoring/alerting (e.g., Sentry, LogRocket)
2. Configure backups (Supabase Pro includes daily backups)
3. Set up staging environment for testing
4. Implement CI/CD pipeline for automated deployments
5. Add end-to-end tests for critical flows

---

## Support

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Project Issues: https://github.com/trenttimmerman/pilotsuite2025/issues
