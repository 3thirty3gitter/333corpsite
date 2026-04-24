#!/usr/bin/env bash
# Quick script to make yourself a master admin in the database directly

set -eu

if [ -z "${1:-}" ]; then
  echo "Usage: $0 your@email.com"
  echo ""
  echo "This will make the specified email an Admin in the employees table."
  echo "If the user doesn't exist, they will be created."
  exit 1
fi

EMAIL="$1"

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
  exit 1
fi

# Extract database connection details from SUPABASE_URL
PROJECT_ID=$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co|\1|')

echo "Making $EMAIL an Admin..."
echo ""

# Use Supabase REST API to upsert the employee
curl -X POST "${SUPABASE_URL}/rest/v1/employees" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d "{\"email\":\"$EMAIL\",\"role\":\"Admin\"}"

echo ""
echo ""
echo "✅ Done! $EMAIL should now be an Admin."
echo ""
echo "You may need to sign out and sign back in for the changes to take effect."
