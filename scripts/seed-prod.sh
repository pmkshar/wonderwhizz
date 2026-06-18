#!/usr/bin/env bash
# Seed the production Neon Postgres database with the expanded question bank.
# Usage:  bash /home/z/my-project/scripts/seed-prod.sh
set -euo pipefail

# Read env vars from the Vercel-pulled file (handles quoted values with special chars)
ENV_FILE="/tmp/vercel-env-prod"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ $ENV_FILE not found. Run:"
  echo "   npx vercel env pull $ENV_FILE --environment production --token <token>"
  exit 1
fi

# Export each non-comment, non-empty line as an env var
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip comments and empty lines
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  # Strip the var name (everything before '=')
  var_name="${line%%=*}"
  # Strip leading/trailing quotes from the value
  var_value="${line#*=}"
  var_value="${var_value#\"}"
  var_value="${var_value%\"}"
  export "$var_name=$var_value"
done < "$ENV_FILE"

echo "DATABASE_URL is: ${DATABASE_URL:0:50}..."
echo "Seeding production database..."
echo ""

cd /home/z/my-project
exec npx tsx scripts/seed.ts
