#!/usr/bin/env bash
set -eu

# Simple script to seed a new row and show recent rows.
# Usage: ./scripts/seed-test.sh [name]

if [ "$1" = "--clear" ] || [ "$1" = "clear" ]; then
  echo "Clearing rows from pilot_test"
  curl -s -X DELETE "http://localhost:3000/api/supabase/pilot_test" | jq || true
  exit 0
fi

NAME="${1:-local-test-$(date +%s)}"

echo "Seeding row with name: $NAME"
curl -s -X POST "http://localhost:3000/api/supabase/seed" \
  -H 'Content-Type: application/json' \
  -d "{\"name\": \"$NAME\"}" | jq || true

echo "\nFetching recent rows from pilot_test:"
curl -s "http://localhost:3000/api/supabase/pilot_test" | jq || true
