#!/usr/bin/env bash
set -eu

if [ -z "$MASTER_ADMIN_SECRET" ]; then
  echo "Set MASTER_ADMIN_SECRET in your environment before running this script." >&2
  exit 1
fi

if [ -z "$1" ]; then
  echo "usage: $0 owner-email@3thirty3.com" >&2
  exit 1
fi

EMAIL="$1"

echo "Creating master admin for $EMAIL"
curl -s -X POST "http://localhost:3000/api/supabase/employees/master" \
  -H 'Content-Type: application/json' \
  -d "{ \"email\": \"$EMAIL\", \"secret\": \"$MASTER_ADMIN_SECRET\" }" | jq
