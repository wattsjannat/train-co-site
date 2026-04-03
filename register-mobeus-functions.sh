#!/bin/bash

# Register Site Functions in Mobeus Dashboard
# This script registers the 3 site functions via Mobeus API

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Mobeus Site Functions Registration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Configuration
AGENT_ID="f0181b10-6d3d-4810-956c-1a3eef93653d"
MOBEUS_API_BASE="https://app.mobeus.ai/api"

# Check if API key is provided
if [ -z "$MOBEUS_API_KEY" ]; then
    echo -e "${RED}Error: MOBEUS_API_KEY environment variable not set${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  export MOBEUS_API_KEY='your-api-key-here'"
    echo -e "  ./register-mobeus-functions.sh"
    echo ""
    echo -e "${YELLOW}Or run with:${NC}"
    echo -e "  MOBEUS_API_KEY='your-api-key-here' ./register-mobeus-functions.sh"
    echo ""
    exit 1
fi

echo -e "${YELLOW}Agent ID:${NC} ${AGENT_ID}"
echo -e "${YELLOW}API Key:${NC} ${MOBEUS_API_KEY:0:20}..."
echo ""

# Function to register a site function
register_function() {
    local function_file=$1
    local function_name=$(basename "$function_file" .json)
    
    echo -e "${YELLOW}Registering ${function_name}...${NC}"
    
    # Try different possible API endpoints
    local endpoints=(
        "${MOBEUS_API_BASE}/v1/agents/${AGENT_ID}/site-functions"
        "${MOBEUS_API_BASE}/agents/${AGENT_ID}/site-functions"
        "${MOBEUS_API_BASE}/v1/agents/${AGENT_ID}/tools"
        "${MOBEUS_API_BASE}/agents/${AGENT_ID}/tools"
        "${MOBEUS_API_BASE}/v1/site-functions"
        "${MOBEUS_API_BASE}/site-functions"
    )
    
    local success=false
    
    for endpoint in "${endpoints[@]}"; do
        echo -e "  Trying: ${endpoint}"
        
        response=$(curl -s -w "\n%{http_code}" -X POST "${endpoint}" \
            -H "Authorization: Bearer ${MOBEUS_API_KEY}" \
            -H "Content-Type: application/json" \
            -d @"${function_file}" 2>&1)
        
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')
        
        if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
            echo -e "${GREEN}  ✓ Success!${NC}"
            echo -e "  Response: ${body}"
            success=true
            break
        elif [ "$http_code" = "404" ]; then
            echo -e "  ${YELLOW}404 - Trying next endpoint...${NC}"
            continue
        else
            echo -e "  ${RED}HTTP ${http_code}${NC}"
            echo -e "  Response: ${body}"
        fi
    done
    
    if [ "$success" = false ]; then
        echo -e "${RED}  ✗ Failed to register ${function_name}${NC}"
        echo -e "${YELLOW}  This endpoint may not exist or may require dashboard registration${NC}"
        return 1
    fi
    
    echo ""
}

# Register each function
echo -e "${BLUE}Registering site functions...${NC}"
echo ""

if [ -f "mobeus-functions/setTheme.json" ]; then
    register_function "mobeus-functions/setTheme.json" || true
else
    echo -e "${RED}Error: mobeus-functions/setTheme.json not found${NC}"
fi

if [ -f "mobeus-functions/navigateToSection.json" ]; then
    register_function "mobeus-functions/navigateToSection.json" || true
else
    echo -e "${RED}Error: mobeus-functions/navigateToSection.json not found${NC}"
fi

if [ -f "mobeus-functions/navigateWithKnowledgeKey.json" ]; then
    register_function "mobeus-functions/navigateWithKnowledgeKey.json" || true
else
    echo -e "${RED}Error: mobeus-functions/navigateWithKnowledgeKey.json not found${NC}"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Registration Attempt Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Note:${NC}"
echo -e "If all endpoints returned 404, the Mobeus API may not support"
echo -e "programmatic site function registration. You'll need to:"
echo ""
echo -e "1. Go to ${GREEN}https://app.mobeus.ai${NC}"
echo -e "2. Navigate to your agent settings"
echo -e "3. Find the 'Site Functions' or 'Custom Tools' section"
echo -e "4. Manually add the 3 functions using the JSON files in ${GREEN}mobeus-functions/${NC}"
echo ""
echo -e "See ${GREEN}MOBEUS_REGISTRATION_GUIDE.md${NC} for detailed instructions."
echo ""
