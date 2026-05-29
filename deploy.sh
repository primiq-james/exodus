#!/usr/bin/env bash

set -euo pipefail

# Terraform may pass AWS_PROFILE as an empty string; unset it so AWS CLI
# falls back to env/instance credentials instead of failing profile lookup.
if [ -z "${AWS_PROFILE:-}" ]; then
  unset AWS_PROFILE
fi

# Configuration - change these values if needed
S3_BUCKET="${S3_BUCKET:-civiq-demo-static-site-3520-katy}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"
BUILD_DIR="${BUILD_DIR:-dist}"                  # change to "build" if your build outputs there

echo "========================================"
echo "Starting deployment to demo/admin civiqguide subdomains"
echo "Bucket:     $S3_BUCKET"
echo "CloudFront: $CLOUDFRONT_DISTRIBUTION_ID"
echo "Build dir:  $BUILD_DIR"
echo "========================================"
echo ""

# CloudFront distribution ID is required for invalidation.
if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo "Error: CLOUDFRONT_DISTRIBUTION_ID is required."
  exit 1
fi

# 0. Install dependencies (required in CI/Terraform runners).
echo "→ Installing dependencies..."
# react-helmet-async has not yet expanded its peer range to React 19.
# Keep CI/Terraform deploy installs stable until upstream is updated.
npm ci --include=dev --legacy-peer-deps

# 1. Build the frontend
echo "→ Building frontend..."
npm run build

# Check if build succeeded and output directory exists
if [ ! -d "$BUILD_DIR" ]; then
  echo "Error: Build directory '$BUILD_DIR' not found. Build failed?"
  exit 1
fi

# 2. Sync to S3
echo ""
echo "→ Uploading to S3: s3://$S3_BUCKET/"
# Keep long-form hosted media assets (uploaded separately) under media/
# so normal frontend deploys do not delete them.
# Force overwrite first so existing objects get re-encrypted if the bucket SSE changed.
aws s3 cp "$BUILD_DIR/" "s3://$S3_BUCKET/" --recursive --exclude "media/*" --sse AES256
aws s3 sync "$BUILD_DIR/" "s3://$S3_BUCKET/" --delete --exclude "media/*" --sse AES256

echo ""
echo "→ Upload complete."

# 3. Create CloudFront invalidation
echo ""
echo "→ Creating CloudFront invalidation for /* ..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "Invalidation created: $INVALIDATION_ID"

# 4. (Optional) Wait for invalidation to complete
echo ""
echo "Waiting for invalidation to complete (can take 5–15 minutes)..."
echo "You can skip this and check status manually in AWS Console if preferred."
echo ""

aws cloudfront wait invalidation-completed \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --id "$INVALIDATION_ID"

echo ""
echo "========================================"
echo "Deployment finished!"
echo ""
echo "Site should now be live at: https://demo.civiqguide.com"
echo ""
echo "Check status:"
echo "  • CloudFront invalidation: https://console.aws.amazon.com/cloudfront/v4/home#/distributions/$CLOUDFRONT_DISTRIBUTION_ID/invalidations"
echo "  • S3 bucket contents:     https://s3.console.aws.amazon.com/s3/buckets/$S3_BUCKET"
echo ""
