#!/bin/bash
# setup-firebase.sh - A script to help set up Firebase authentication for CrucialCars

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}    Setting up Firebase for CrucialCars    ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Check if .env files exist
echo -e "\n${YELLOW}Checking environment files...${NC}"

if [ ! -f "./frontend/.env" ]; then
    echo -e "${GREEN}Creating frontend/.env from template...${NC}"
    cp ./frontend/.env.template ./frontend/.env
    echo -e "${YELLOW}Please edit frontend/.env with your Firebase configuration${NC}"
else
    echo -e "${GREEN}frontend/.env already exists${NC}"
fi

if [ ! -f "./backend/.env" ]; then
    echo -e "${GREEN}Creating backend/.env from template...${NC}"
    cp ./backend/.env.template ./backend/.env
    echo -e "${YELLOW}Please edit backend/.env with your configuration${NC}"
else
    echo -e "${GREEN}backend/.env already exists${NC}"
fi

# 2. Check Firebase service account key
echo -e "\n${YELLOW}Checking Firebase service account key...${NC}"

if [ ! -f "./backend/firebaseServiceAccountKey.json" ]; then
    echo -e "${RED}Firebase service account key not found!${NC}"
    echo -e "${YELLOW}Please download your service account key from Firebase Console:${NC}"
    echo -e "1. Go to Firebase Console > Project Settings > Service accounts"
    echo -e "2. Click 'Generate new private key'"
    echo -e "3. Save the file as 'firebaseServiceAccountKey.json' in the backend directory"
else
    echo -e "${GREEN}Firebase service account key found!${NC}"
fi

# 3. Display instructions
echo -e "\n${YELLOW}Firebase Setup Instructions:${NC}"
echo -e "1. Go to ${BLUE}https://console.firebase.google.com/${NC}"
echo -e "2. Create a new project or select an existing one"
echo -e "3. Add a web app to your Firebase project"
echo -e "4. Copy the Firebase config values to frontend/.env"
echo -e "5. Enable Google Authentication in Firebase Console"
echo -e "   - Go to Authentication > Sign-in method"
echo -e "   - Enable Google provider"
echo -e "6. Generate a service account key if you haven't already"
echo -e "   - Project Settings > Service accounts"
echo -e "   - Save as 'firebaseServiceAccountKey.json' in the backend directory"

echo -e "\n${GREEN}Setup script complete!${NC}"
echo -e "${BLUE}====================================================${NC}"
