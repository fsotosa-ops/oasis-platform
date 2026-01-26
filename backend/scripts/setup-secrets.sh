#!/bin/bash
# ============================================================================
# Secret Manager Setup Script for OASIS API
#
# This script creates the required secrets in Google Secret Manager.
# Secrets are created empty - you must add values via Console or gcloud.
#
# Prerequisites:
# - gcloud CLI installed and authenticated
# - Secret Manager API enabled (run gcp-setup.sh first)
#
# Usage:
#   ./scripts/setup-secrets.sh <PROJECT_ID> <ENVIRONMENT>
#
# Example:
#   ./scripts/setup-secrets.sh my-oasis-dev dev
#   ./scripts/setup-secrets.sh my-oasis-prod prod
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Error: Missing arguments${NC}"
    echo "Usage: $0 <PROJECT_ID> <ENVIRONMENT>"
    echo "Example: $0 my-oasis-dev dev"
    exit 1
fi

PROJECT_ID=$1
ENVIRONMENT=$2

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
    echo -e "${RED}Error: ENVIRONMENT must be 'dev' or 'prod'${NC}"
    exit 1
fi

ENV_SUFFIX=$(echo "$ENVIRONMENT" | tr '[:lower:]' '[:upper:]')

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  OASIS API - Secret Manager Setup${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Project ID:   $PROJECT_ID"
echo "Environment:  $ENVIRONMENT"
echo ""

# Set project
gcloud config set project "$PROJECT_ID"

# Define secrets
SECRETS=(
    "SUPABASE_URL_${ENV_SUFFIX}"
    "SUPABASE_ANON_KEY_${ENV_SUFFIX}"
    "SUPABASE_SERVICE_ROLE_KEY_${ENV_SUFFIX}"
    "SUPABASE_JWT_SECRET_${ENV_SUFFIX}"
    "GOOGLE_API_KEY_${ENV_SUFFIX}"
    "SERVICE_TO_SERVICE_TOKEN_${ENV_SUFFIX}"
    "WEBHOOK_TYPEFORM_SECRET_${ENV_SUFFIX}"
    "WEBHOOK_STRIPE_SECRET_${ENV_SUFFIX}"
)

# Shared secrets (only create once)
SHARED_SECRETS=(
    "JWT_ALGORITHM"
)

create_secret() {
    local secret_name=$1

    if gcloud secrets describe "$secret_name" &>/dev/null; then
        echo -e "  ${GREEN}[EXISTS]${NC} $secret_name"
    else
        gcloud secrets create "$secret_name" \
            --replication-policy="automatic" \
            --labels="environment=${ENVIRONMENT},app=oasis-api"
        echo -e "  ${YELLOW}[CREATED]${NC} $secret_name"
    fi
}

echo -e "${YELLOW}Creating environment-specific secrets...${NC}"
for SECRET in "${SECRETS[@]}"; do
    create_secret "$SECRET"
done

echo ""
echo -e "${YELLOW}Creating shared secrets...${NC}"
for SECRET in "${SHARED_SECRETS[@]}"; do
    create_secret "$SECRET"
done

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Secrets Created Successfully${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Secrets are created EMPTY.${NC}"
echo "Add values using one of these methods:"
echo ""
echo "Option 1: Google Cloud Console"
echo "  https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
echo ""
echo "Option 2: gcloud CLI"
echo "  echo -n 'your-secret-value' | gcloud secrets versions add SECRET_NAME --data-file=-"
echo ""
echo "Example commands:"
echo ""
for SECRET in "${SECRETS[@]}"; do
    echo "  echo -n 'VALUE' | gcloud secrets versions add $SECRET --data-file=-"
done
echo ""
echo "For JWT_ALGORITHM (typically 'HS256'):"
echo "  echo -n 'HS256' | gcloud secrets versions add JWT_ALGORITHM --data-file=-"
