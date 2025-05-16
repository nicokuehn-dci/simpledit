#!/bin/bash

# Script to start the Multilingual Text Editor with AI Assistant

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Multilingual Text Editor with Groq AI ===${NC}"

# Navigate to the project directory
cd "$(dirname "$0")"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed.${NC}"
    echo "Please install Python 3 to run the AI backend."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo "Please install Node.js to run this application."
    exit 1
fi

# Check if virtual environment exists, create if not
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv backend/venv
fi

# Check if pip packages are installed
echo -e "${YELLOW}Setting up and checking Python dependencies...${NC}"
source backend/venv/bin/activate

# Function to check if Python package is installed
check_python_package() {
    local package_name="$1"
    local package_version="$2"
    if ! pip list | grep -q "^$package_name\\s"; then
        echo -e "${YELLOW}Package $package_name not found. Installing...${NC}"
        return 1
    elif [ ! -z "$package_version" ]; then
        local installed_version=$(pip list | grep "^$package_name\\s" | awk '{print $2}')
        if [ "$(printf '%s\n' "$package_version" "$installed_version" | sort -V | head -n1)" != "$package_version" ]; then
            echo -e "${YELLOW}Package $package_name version $installed_version is older than required $package_version. Updating...${NC}"
            return 1
        fi
    fi
    return 0
}

# Check essential Python packages
missing_packages=false
for pkg in "fastapi>=0.100.0" "uvicorn>=0.23.0" "httpx>=0.24.1" "python-dotenv>=1.0.0" "pydantic>=2.0.0"; do
    pkg_name=$(echo "$pkg" | sed 's/>=.*//')
    pkg_version=$(echo "$pkg" | sed -n 's/.*>=\(.*\)/\1/p')
    
    if ! check_python_package "$pkg_name" "$pkg_version"; then
        missing_packages=true
    fi
done

# If any packages are missing or outdated, install all from requirements.txt
if [ "$missing_packages" = true ]; then
    echo -e "${YELLOW}Installing/updating Python dependencies...${NC}"
    pip install -r backend/requirements.txt
else
    echo -e "${GREEN}All Python dependencies are already satisfied.${NC}"
fi

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}Node.js dependencies are already installed.${NC}"
    
    # Check for essential npm packages
    if ! npm list --depth=0 | grep -q "react@"; then
        echo -e "${YELLOW}Some Node.js dependencies may be missing. Reinstalling...${NC}"
        npm install
    fi
fi

# Check if .env file exists and contains GROQ_API_KEY
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file is missing${NC}"
    echo -e "Creating a template .env file. Please edit it to add your Groq API key."
    echo "GROQ_API_KEY=your_api_key_here" > .env
    echo -e "${YELLOW}Created .env file. Please edit it to add your actual Groq API key.${NC}"
    exit 1
elif ! grep -q "GROQ_API_KEY" .env; then
    echo -e "${RED}Error: GROQ_API_KEY not found in .env file${NC}"
    echo -e "Please add your Groq API key to the .env file."
    exit 1
elif grep -q "GROQ_API_KEY=your_api_key_here" .env; then
    echo -e "${RED}Error: Default API key detected in .env file${NC}"
    echo -e "Please replace the placeholder with your actual Groq API key."
    exit 1
else
    echo -e "${GREEN}Groq API key found in .env file.${NC}"
fi

# Start the FastAPI backend in the background
echo -e "${GREEN}Starting the AI backend server...${NC}"
echo -e "${BLUE}The API will be available at: ${GREEN}http://localhost:8000${NC}"
source backend/venv/bin/activate
cd backend
python3 app.py &
BACKEND_PID=$!
cd ..

# Allow the backend to start
sleep 2

# Start the frontend development server
echo -e "${GREEN}Starting the frontend application...${NC}"
echo -e "${BLUE}The editor will be available at: ${GREEN}http://localhost:3000${NC}"

# Function to handle termination
cleanup() {
    echo -e "${YELLOW}Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set up the trap for SIGINT (Ctrl+C)
trap cleanup INT

# Start React frontend
npm start

# If npm start exits, clean up the backend as well
cleanup
