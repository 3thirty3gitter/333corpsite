#!/usr/bin/env bash
set -euo pipefail

# Script to verify environment variables are set correctly
# Usage: ./scripts/check-env.sh

echo "🔍 Checking environment variables..."
echo ""

check_var() {
  local var_name=$1
  if [ -z "${!var_name:-}" ]; then
    echo "❌ $var_name is NOT set"
    return 1
  else
    echo "✅ $var_name is set"
    return 0
  fi
}

# Source .env.local if it exists
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
  echo "📄 Loaded .env.local"
  echo ""
else
  echo "⚠️  .env.local not found"
  echo "Create it from .env.example: cp .env.example .env.local"
  echo ""
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
check_var "GEMINI_API_KEY" || true
check_var "GENKIT_TELEMETRY_SERVER" || true
check_var "ENABLE_FIREBASE_MONITORING" || true

echo ""
if [ "$all_set" = true ]; then
  echo "✅ All required environment variables are set!"
  echo ""
  echo "Next steps:"
  echo "1. Run dev server: npm run dev"
  echo "2. Test health endpoint: curl http://localhost:3000/api/supabase/health"
  echo "3. Apply migrations: ./scripts/apply-migrations.sh"
  echo "4. Create master admin: ./scripts/create-master-admin.sh admin@3thirty3.com"
else
  echo "❌ Some required environment variables are missing."
  echo ""
  echo "Fix this by:"
  echo "1. Copy .env.example to .env.local: cp .env.example .env.local"
  echo "2. Edit .env.local and fill in your Supabase credentials"
  echo "3. Generate MASTER_ADMIN_SECRET: openssl rand -hex 32"
  echo "4. Run this script again to verify"
  exit 1
fi
