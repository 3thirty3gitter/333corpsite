# Production Environment Setup - Verification Checklist

Use this checklist to verify your production environment is correctly configured.

## ✅ Pre-Deployment Checklist

### 1. Supabase Project Setup
- [ ] Supabase project created at https://app.supabase.com/
- [ ] Project URL noted: `https://xxxxx.supabase.co`
- [ ] Anon key copied from Settings → API
- [ ] Service role key copied from Settings → API (KEEP SECRET!)
- [ ] Database password saved securely

### 2. Local Environment Configuration
- [ ] `.env.local` file created from `.env.example`
- [ ] `NEXT_PUBLIC_APP_URL` set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_URL` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] `MASTER_ADMIN_SECRET` generated: `openssl rand -hex 32`
- [ ] `GEMINI_API_KEY` set (optional, for AI features)

### 3. Database Migrations
- [ ] Migration scripts reviewed:
  - [ ] `001_create_pilot_test_table.sql`
  - [ ] `002_create_employees_table.sql`
  - [ ] `003_add_rls_policies.sql`
- [ ] Migrations applied: `./scripts/apply-migrations.sh`
- [ ] Tables verified in Supabase Dashboard → Table Editor
- [ ] RLS policies enabled and verified

### 4. Supabase Auth Configuration
- [ ] Redirect URLs configured in Supabase Dashboard:
  - [ ] `http://localhost:3000/**` (for local dev)
  - [ ] `https://your-app.vercel.app/**` (for production)
  - [ ] `https://*.vercel.app/**` (for preview deployments)
- [ ] Site URL set: `https://your-app.vercel.app`
- [ ] Email templates reviewed (optional)
- [ ] SMTP configured (optional, for custom emails)

### 5. Vercel Deployment
- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Logged into Vercel: `vercel login`
- [ ] Initial deployment: `vercel`
- [ ] Production URL noted: `https://your-app.vercel.app`
- [ ] Environment variables set in Vercel (all of them):
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `MASTER_ADMIN_SECRET`
  - [ ] `GEMINI_API_KEY` (optional)
- [ ] Production deployment: `vercel --prod`

### 6. Master Admin Creation
- [ ] Master admin script tested locally
- [ ] Master admin created in production: `./scripts/create-master-admin.sh admin@3thirty3.com`
- [ ] Admin verified in Supabase Dashboard → employees table

---

## 🧪 Post-Deployment Testing

### API Health Checks
Run these commands to verify your deployment:

```bash
# Health check
curl https://your-app.vercel.app/api/supabase/health
# Expected: {"connected":true,"message":"Supabase admin client initialized"}

# Database write test
curl -X POST https://your-app.vercel.app/api/supabase/seed \
  -H 'Content-Type: application/json' \
  -d '{"name":"production-test"}'
# Expected: {"success":true,"rows":[...]}

# Database read test
curl https://your-app.vercel.app/api/supabase/pilot_test
# Expected: {"success":true,"rows":[...]}
```

### Manual Testing Checklist
- [ ] Landing page loads: `https://your-app.vercel.app`
- [ ] Sign-in page accessible: `https://your-app.vercel.app/auth/signin`
- [ ] Sign-in with password works
- [ ] Magic link email received (check spam)
- [ ] Dashboard loads after sign-in: `https://your-app.vercel.app/dashboard`
- [ ] Admin pages accessible (for @3thirty3.com emails):
  - [ ] `/dashboard/products`
  - [ ] `/dashboard/billing`
  - [ ] `/dashboard/team`
- [ ] Team invite functionality works
- [ ] AI product suggestion works (if `GEMINI_API_KEY` set)

### Security Verification
- [ ] `.env.local` NOT committed to git
- [ ] Service role key NOT exposed in browser
- [ ] All API routes properly authenticated
- [ ] RLS policies tested and working
- [ ] Admin routes blocked for non-admin users

---

## 🔍 Environment Variables Verification

Use this script to check if all required environment variables are set:

```bash
#!/usr/bin/env bash
echo "Checking environment variables..."
echo ""

check_var() {
  if [ -z "${!1}" ]; then
    echo "❌ $1 is NOT set"
    return 1
  else
    echo "✅ $1 is set"
    return 0
  fi
}

# Source .env.local if it exists
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
fi

REQUIRED_VARS=(
  "NEXT_PUBLIC_APP_URL"
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"
  "MASTER_ADMIN_SECRET"
)

echo "Required variables:"
all_set=true
for var in "${REQUIRED_VARS[@]}"; do
  if ! check_var "$var"; then
    all_set=false
  fi
done

echo ""
echo "Optional variables:"
check_var "GEMINI_API_KEY"

echo ""
if [ "$all_set" = true ]; then
  echo "✅ All required environment variables are set!"
else
  echo "❌ Some required environment variables are missing."
  echo "Copy .env.example to .env.local and fill in the values."
  exit 1
fi
```

Save as `scripts/check-env.sh` and run: `chmod +x scripts/check-env.sh && ./scripts/check-env.sh`

---

## 🚨 Common Issues & Solutions

### Issue: "Supabase not configured"
**Solution:**
1. Verify env vars in Vercel Dashboard
2. Ensure `NEXT_PUBLIC_*` variables are set (not just `SUPABASE_*`)
3. Redeploy after setting env vars: `vercel --prod`

### Issue: Magic link not received
**Solution:**
1. Check spam/junk folder
2. Verify redirect URLs in Supabase Auth settings
3. Check Supabase logs: Dashboard → Logs → Auth Logs
4. Configure custom SMTP if needed

### Issue: "unauthorized" on admin routes
**Solution:**
1. Ensure email ends with `@3thirty3.com`
2. Check employees table has admin role
3. Verify JWT token is being sent correctly

### Issue: Database queries fail
**Solution:**
1. Check Supabase project is active (may pause on free tier)
2. Verify service role key is correct
3. Check RLS policies allow the operation
4. View Supabase logs: Dashboard → Logs → Database Logs

### Issue: Migrations fail to apply
**Solution:**
1. Check Supabase CLI is installed: `brew install supabase/tap/supabase`
2. Run migrations manually via Supabase Dashboard → SQL Editor
3. Verify database connection string is correct
4. Check for syntax errors in SQL files

---

## 📊 Monitoring & Maintenance

### Daily Checks
- [ ] Check Vercel deployment status
- [ ] Review error logs in Vercel dashboard
- [ ] Monitor Supabase usage (Database → Usage)

### Weekly Checks
- [ ] Review auth logs for suspicious activity
- [ ] Check API response times
- [ ] Verify backup status (Supabase Pro feature)

### Monthly Checks
- [ ] Review and rotate secrets if needed
- [ ] Check for dependency updates
- [ ] Review RLS policies and access controls
- [ ] Archive old test data

---

## 🎯 Success Criteria

Your production environment is ready when:
- ✅ All API health checks pass
- ✅ Sign-in flow works end-to-end
- ✅ Master admin can access all admin pages
- ✅ Team invite functionality works
- ✅ No errors in Vercel deployment logs
- ✅ No errors in Supabase logs
- ✅ All environment variables properly set
- ✅ Database migrations applied successfully
- ✅ RLS policies enforced
- ✅ CI/CD pipeline passes all checks

---

## 📞 Support Resources

- **Supabase Issues**: https://github.com/supabase/supabase/issues
- **Vercel Support**: https://vercel.com/support
- **Next.js Docs**: https://nextjs.org/docs
- **Project Issues**: https://github.com/trenttimmerman/pilotsuite2025/issues

---

**Last Updated**: November 18, 2025
