#!/bin/bash

# Deploy train-co-site to trainco-v1 infrastructure
# This script builds the Docker image and pushes it to ECR

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="eu-west-1"
AWS_ACCOUNT_ID="222308823987"
ECR_REPOSITORY="trainco/dev/train-co-site"
IMAGE_TAG="latest"
ECS_CLUSTER="trainco-dev"
ECS_SERVICE="trainco-dev-train-co-site"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Train Co Site - Deployment to trainco-v1${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the train-co-site directory.${NC}"
    exit 1
fi

# Step 1: Install dependencies
echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Build the Next.js application
echo -e "${YELLOW}Step 2: Building Next.js application...${NC}"
npm run build
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Step 3: Build Docker image for linux/amd64 with build args
echo -e "${YELLOW}Step 3: Building Docker image for linux/amd64...${NC}"
MOBEUS_API_KEY="${MOBEUS_API_KEY:-vk_dev_5b48511ab42cc4719aded03329b36b2af8b9c646345d3b30}"
docker buildx build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_WIDGET_API_KEY="${MOBEUS_API_KEY}" \
  --build-arg NEXT_PUBLIC_WIDGET_HOST="https://app.mobeus.ai" \
  --build-arg NEXT_PUBLIC_AGENT_NAME="Train Co" \
  -t train-co-site:${IMAGE_TAG} .
echo -e "${GREEN}✓ Docker image built${NC}"
echo ""

# Step 4: Login to ECR
echo -e "${YELLOW}Step 4: Logging in to AWS ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | \
    docker login --username AWS --password-stdin \
    ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
echo -e "${GREEN}✓ Logged in to ECR${NC}"
echo ""

# Step 5: Tag image for ECR
echo -e "${YELLOW}Step 5: Tagging image for ECR...${NC}"
ECR_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}"
docker tag train-co-site:${IMAGE_TAG} ${ECR_IMAGE}
echo -e "${GREEN}✓ Image tagged: ${ECR_IMAGE}${NC}"
echo ""

# Step 6: Push image to ECR
echo -e "${YELLOW}Step 6: Pushing image to ECR...${NC}"
docker push ${ECR_IMAGE}
echo -e "${GREEN}✓ Image pushed to ECR${NC}"
echo ""

# Step 7: Update ECS service (force new deployment)
echo -e "${YELLOW}Step 7: Updating ECS service...${NC}"
aws ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE} \
    --force-new-deployment \
    --region ${AWS_REGION} > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ ECS service update initiated${NC}"
else
    echo -e "${YELLOW}⚠ ECS service not found or not yet created${NC}"
    echo -e "${YELLOW}  This is normal if this is your first deployment${NC}"
    echo -e "${YELLOW}  Run 'terraform apply' in trainco-v1/terraform to create the service${NC}"
fi
echo ""

# Step 8: Display deployment info
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Image: ${ECR_IMAGE}"
echo -e "Cluster: ${ECS_CLUSTER}"
echo -e "Service: ${ECS_SERVICE}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. If this is your first deployment, apply Terraform changes in trainco-v1:"
echo -e "   ${GREEN}cd ~/trainco-v1/terraform && terraform apply${NC}"
echo ""
echo -e "2. Check service status:"
echo -e "   ${GREEN}aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} --region ${AWS_REGION}${NC}"
echo ""
echo -e "3. View logs:"
echo -e "   ${GREEN}aws logs tail /ecs/trainco-dev/train-co-site --follow --region ${AWS_REGION}${NC}"
echo ""
echo -e "4. Access the application:"
echo -e "   ${GREEN}https://train-v1.rapidprototype.ai/v2${NC}"
echo ""
