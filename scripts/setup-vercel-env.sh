#!/usr/bin/env bash
set -euo pipefail

# Script to set up all environment variables in Vercel
# Usage: ./scripts/setup-vercel-env.sh [production|preview|development]

ENVIRONMENT="${1:-production}"

echo "🚀 Setting up Vercel environment variables for: $ENVIRONMENT"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "Install it with: npm i -g vercel"
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please create it from .env.example"
    exit 1
fi

# Source .env.local
set -a
source .env.local
set +a

echo "📝 Setting environment variables in Vercel..."
echo ""

# Function to set a Vercel environment variable
set_vercel_env() {
    local key=$1
    local value=$2
    
    if [ -z "$value" ]; then
        echo "⚠️  Skipping $key (empty value)"
        return
    fi
    
    echo "▶️  Setting $key"
    echo "$value" | vercel env add "$key" "$ENVIRONMENT" --force 2>/dev/null || {
        echo "⚠️  Failed to set $key (may already exist or need manual setup)"
    }
}

# Set required variables
echo "Setting REQUIRED variables..."
set_vercel_env "NEXT_PUBLIC_APP_URL" "${NEXT_PUBLIC_APP_URL:-}"
set_vercel_env "NEXT_PUBLIC_SUPABASE_URL" "${NEXT_PUBLIC_SUPABASE_URL:-}"
set_vercel_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}"
set_vercel_env "SUPABASE_URL" "${SUPABASE_URL:-}"
set_vercel_env "SUPABASE_SERVICE_ROLE_KEY" "${SUPABASE_SERVICE_ROLE_KEY:-}"
set_vercel_env "MASTER_ADMIN_SECRET" "${MASTER_ADMIN_SECRET:-}"

echo ""
echo "Setting OPTIONAL variables..."
set_vercel_env "GEMINI_API_KEY" "${GEMINI_API_KEY:-}"
set_vercel_env "GENKIT_TELEMETRY_SERVER" "${GENKIT_TELEMETRY_SERVER:-}"
set_vercel_env "ENABLE_FIREBASE_MONITORING" "${ENABLE_FIREBASE_MONITORING:-false}"

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify in Vercel Dashboard: https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
echo "2. Redeploy your app: vercel --prod"
echo "3. Test the deployment: curl https://your-app.vercel.app/api/supabase/health"
