# Authentication Setup Checklist

## 1. Local Development (.env.local)
Add these credentials to your `.env.local` file (get them from your Supabase dashboard):

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=https://pilotsuite2025-git-preview-supabase-setup-333-production2025.vercel.app
```

## 2. Production (Vercel)
Set these environment variables in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL=https://pilotsuite2025-git-preview-supabase-setup-333-production2025.vercel.app`

After updating, redeploy your app.

## 3. Supabase Auth Settings
In Supabase dashboard → Authentication → URL Configuration:

- **Site URL:**
  - `https://pilotsuite2025-git-preview-supabase-setup-333-production2025.vercel.app`
- **Redirect URLs:**
  - `https://pilotsuite2025-git-preview-supabase-setup-333-production2025.vercel.app/auth/signin`

---

## Quick Reference
- Always use your actual Supabase project credentials (URL, anon key, service role key).
- The app URL must match your deployed Vercel domain for magic link redirects.
- After any environment variable change, redeploy your app.
- For troubleshooting, check `.env.local`, Vercel envs, and Supabase Auth settings.
