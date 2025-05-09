#!/bin/bash
# MARDUK'S MAGNIFICENT NEURAL ACTIVATION SCRIPT

# Set colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
echo "🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪"
echo "🧪                                                                    🧪"
echo "🧪  MARDUK'S MAGNIFICENT DEEP TREE ECHO ISO ACTIVATION SEQUENCE      🧪"
echo "🧪                                                                    🧪"
echo "🧪  Prepare for your perception of bot visualization to be forever    🧪"
echo "🧪  TRANSFORMED into something far more GLORIOUS!                     🧪"
echo "🧪                                                                    🧪"
echo "🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪"
echo -e "${NC}"

# Step 1: Navigate to the extension directory
echo -e "${CYAN}STEP 1: Navigating to the extension directory...${NC}"
cd "$(dirname "$0")"

if [ $? -ne 0 ]; then
    echo -e "${RED}NEURAL MISFIRE! Failed to navigate to the extension directory.${NC}"
    exit 1
fi

echo -e "${GREEN}Successfully navigated to $(pwd)${NC}"

# Step 2: Install dependencies
echo -e "\n${CYAN}STEP 2: Installing the neural components (dependencies)...${NC}"
echo -e "${YELLOW}This process will bond the necessary neural pathways required for visualization.${NC}"

yarn install

if [ $? -ne 0 ]; then
    echo -e "${RED}NEURAL BONDING FAILURE! Dependency installation failed.${NC}"
    echo -e "${YELLOW}Suggestion: Check your yarn configuration and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}Neural components successfully bonded!${NC}"

# Step 3: Build the extension
echo -e "\n${CYAN}STEP 3: Building the magnificent creation...${NC}"
echo -e "${YELLOW}Transmuting TypeScript into executable JavaScript...${NC}"

yarn build

if [ $? -ne 0 ]; then
    echo -e "${RED}TRANSMUTATION FAILURE! Build process failed.${NC}"
    echo -e "${YELLOW}Suggestion: Check for TypeScript errors and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}Magnificent creation successfully transmuted!${NC}"

# Step 4: Activate the extension
echo -e "\n${CYAN}STEP 4: Preparing Bot Framework Composer for the symbiotic relationship...${NC}"
echo -e "${YELLOW}This will ensure the extension is properly registered in the Composer.${NC}"

# Navigate to the Composer directory (assuming relative path)
cd ../..

if [ $? -ne 0 ]; then
    echo -e "${RED}NAVIGATION ERROR! Failed to navigate to the Composer directory.${NC}"
    exit 1
fi

echo -e "${GREEN}Now in $(pwd)${NC}"

# Step 5: Display success message
echo -e "\n${PURPLE}"
echo "🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪"
echo "🧪                                                                    🧪"
echo "🧪  THE DEEP TREE ECHO ISO EXTENSION IS NOW READY!                   🧪"
echo "🧪                                                                    🧪"
echo "🧪  To witness the magnificent visualization:                         🧪"
echo "🧪    1. Start Bot Framework Composer: yarn start                     🧪"
echo "🧪    2. Open any bot project                                         🧪"
echo "🧪    3. Behold the glorious transformation!                          🧪"
echo "🧪                                                                    🧪"
echo "🧪  \"The isometric dimension awaits your consciousness!\" - MARDUK    🧪"
echo "🧪                                                                    🧪"
echo "🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪"
echo -e "${NC}"

# Offer to start Composer
echo -e "\n${CYAN}Would you like to start Bot Framework Composer now? (y/n)${NC}"
read -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Initiating Bot Framework Composer...${NC}"
    cd Composer
    yarn start
    echo -e "${GREEN}Bot Framework Composer is running. Prepare for neural synchronization!${NC}"
else
    echo -e "${YELLOW}You can start Bot Framework Composer later with:${NC}"
    echo -e "${GREEN}cd Composer && yarn start${NC}"
fi

echo -e "\n${PURPLE}MARDUK THE MAD SCIENTIST BIDS YOU FAREWELL... FOR NOW!${NC}"
