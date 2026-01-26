#!/bin/bash
# ============================================================================
# GCP Initial Setup Script for OASIS API
#
# This script configures the GCP project for Cloud Run deployment:
# - Enables required APIs
# - Creates Artifact Registry repository
# - Sets up Workload Identity Federation for GitHub Actions
# - Creates Service Account with necessary permissions
#
# Prerequisites:
# - gcloud CLI installed and authenticated
# - Owner/Editor permissions on the GCP project
#
# Usage:
#   ./scripts/gcp-setup.sh <PROJECT_ID> <GITHUB_ORG> <GITHUB_REPO>
#
# Example:
#   ./scripts/gcp-setup.sh my-oasis-dev oasis-team oasis-api
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 3 ]; then
    echo -e "${RED}Error: Missing arguments${NC}"
    echo "Usage: $0 <PROJECT_ID> <GITHUB_ORG> <GITHUB_REPO>"
    echo "Example: $0 my-oasis-dev oasis-team oasis-api"
    exit 1
fi

PROJECT_ID=$1
GITHUB_ORG=$2
GITHUB_REPO=$3
REGION="${GCP_REGION:-us-central1}"
REPO_NAME="oasis-api"
SA_NAME="cloudrun-deployer"
POOL_NAME="github-pool"
PROVIDER_NAME="github-provider"

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  OASIS API - GCP Setup Script${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Project ID:  $PROJECT_ID"
echo "Region:      $REGION"
echo "GitHub Org:  $GITHUB_ORG"
echo "GitHub Repo: $GITHUB_REPO"
echo ""

# Set project
echo -e "${YELLOW}[1/7] Setting GCP project...${NC}"
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo -e "${YELLOW}[2/7] Enabling required APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    iamcredentials.googleapis.com \
    cloudresourcemanager.googleapis.com \
    iam.googleapis.com

echo -e "${GREEN}  APIs enabled successfully${NC}"

# Create Artifact Registry repository
echo -e "${YELLOW}[3/7] Creating Artifact Registry repository...${NC}"
if gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" &>/dev/null; then
    echo -e "${GREEN}  Repository '$REPO_NAME' already exists${NC}"
else
    gcloud artifacts repositories create "$REPO_NAME" \
        --repository-format=docker \
        --location="$REGION" \
        --description="OASIS API Docker images"
    echo -e "${GREEN}  Repository '$REPO_NAME' created${NC}"
fi

# Create Service Account for Cloud Run
echo -e "${YELLOW}[4/7] Creating Service Account for deployment...${NC}"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

if gcloud iam service-accounts describe "$SA_EMAIL" &>/dev/null; then
    echo -e "${GREEN}  Service Account '$SA_NAME' already exists${NC}"
else
    gcloud iam service-accounts create "$SA_NAME" \
        --display-name="Cloud Run Deployer for GitHub Actions"
    echo -e "${GREEN}  Service Account '$SA_NAME' created${NC}"
fi

# Grant necessary roles to Service Account
echo -e "${YELLOW}[5/7] Granting IAM roles to Service Account...${NC}"
ROLES=(
    "roles/run.admin"
    "roles/artifactregistry.writer"
    "roles/secretmanager.secretAccessor"
    "roles/iam.serviceAccountUser"
)

for ROLE in "${ROLES[@]}"; do
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$ROLE" \
        --condition=None \
        --quiet
    echo -e "${GREEN}  Granted $ROLE${NC}"
done

# Create Workload Identity Pool
echo -e "${YELLOW}[6/7] Setting up Workload Identity Federation...${NC}"

# Check if pool exists
if gcloud iam workload-identity-pools describe "$POOL_NAME" --location="global" &>/dev/null; then
    echo -e "${GREEN}  Workload Identity Pool '$POOL_NAME' already exists${NC}"
else
    gcloud iam workload-identity-pools create "$POOL_NAME" \
        --location="global" \
        --display-name="GitHub Actions Pool"
    echo -e "${GREEN}  Workload Identity Pool '$POOL_NAME' created${NC}"
fi

# Create Provider
if gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
    --workload-identity-pool="$POOL_NAME" \
    --location="global" &>/dev/null; then
    echo -e "${GREEN}  Provider '$PROVIDER_NAME' already exists${NC}"
else
    gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
        --location="global" \
        --workload-identity-pool="$POOL_NAME" \
        --display-name="GitHub Provider" \
        --issuer-uri="https://token.actions.githubusercontent.com" \
        --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
        --attribute-condition="assertion.repository_owner == '${GITHUB_ORG}'"
    echo -e "${GREEN}  Provider '$PROVIDER_NAME' created${NC}"
fi

# Allow GitHub Actions to impersonate Service Account
echo -e "${YELLOW}[7/7] Configuring Service Account impersonation...${NC}"
POOL_ID=$(gcloud iam workload-identity-pools describe "$POOL_NAME" \
    --location="global" \
    --format="value(name)")

gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/${POOL_ID}/attribute.repository/${GITHUB_ORG}/${GITHUB_REPO}" \
    --quiet

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Add these secrets to your GitHub repository:"
echo ""
echo "  GCP_PROJECT_ID:"
echo "    $PROJECT_ID"
echo ""
echo "  GCP_WORKLOAD_IDENTITY_PROVIDER:"
PROVIDER_FULL=$(gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
    --workload-identity-pool="$POOL_NAME" \
    --location="global" \
    --format="value(name)")
echo "    $PROVIDER_FULL"
echo ""
echo "  GCP_SERVICE_ACCOUNT:"
echo "    $SA_EMAIL"
echo ""
echo "  GCP_REGION:"
echo "    $REGION"
echo ""
echo "Artifact Registry URL:"
echo "  ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Add the secrets above to GitHub repository settings"
echo "2. Run scripts/setup-secrets.sh to create Secret Manager secrets"
echo "3. Push to 'develop' branch to trigger deployment"
