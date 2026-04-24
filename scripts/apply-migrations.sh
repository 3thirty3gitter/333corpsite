#!/usr/bin/env bash
set -euo pipefail

# Script to apply Supabase migrations to your project
# Usage: ./scripts/apply-migrations.sh

echo "🚀 Applying Supabase migrations..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Check if project is linked
if [ ! -f "supabase/config.toml" ] && [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Supabase project not linked locally."
    # Try to extract project ref from .env.local if available
    if [ -f ".env.local" ]; then
        PROJECT_REF=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | sed 's/.*\/\/\([^.]*\).*/\1/')
    fi
    
    if [ -n "${PROJECT_REF:-}" ]; then
        echo "🔗 Linking to project: $PROJECT_REF"
        echo "🔑 You will be asked for your database password."
        supabase link --project-ref "$PROJECT_REF"
    else
        echo "❌ Could not determine project ref from .env.local"
        echo "Please run: supabase link --project-ref your-project-ref"
        exit 1
    fi
fi

echo "▶️  Pushing migrations..."
supabase db push

echo "🎉 Database setup complete!"
