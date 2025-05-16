#!/bin/bash

# Script to start the Multilingual Text Editor with AI Assistant

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== simpledit - Multilingual Text Editor with Groq AI ===${NC}"

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

# First, check if there's already a backend server running
if lsof -i:8000 >/dev/null 2>&1; then
    echo -e "${YELLOW}Backend server already running on port 8000. Stopping it...${NC}"
    fuser -k 8000/tcp >/dev/null 2>&1
    sleep 1
fi

# Ensure we're using the virtual environment
source backend/venv/bin/activate

# Start the backend server with improved error handling
cd backend

# Function to check backend health
check_backend_health() {
    curl -s http://localhost:8000/health >/dev/null
    return $?
}

# Configure the log file with timestamp
log_file="../backend_server.log"
echo "=== Backend Server Started at $(date) ===" > $log_file
echo "Host: $(hostname)" >> $log_file
echo "System: $(uname -a)" >> $log_file
echo "Python: $(python3 --version)" >> $log_file
echo "Dependencies check..." >> $log_file

# Validate required packages before starting
python3 -c "
try:
    import uvicorn
    import fastapi
    import httpx
    import dotenv
    import pydantic
    print('All required packages verified.')
except ImportError as e:
    print(f'Error importing required package: {e}')
    exit(1)
" >> $log_file 2>&1

# Check if validation failed and install if needed
if [ $? -ne 0 ]; then
    echo -e "${RED}Missing required packages. Installing...${NC}"
    pip install -r requirements.txt >> $log_file 2>&1
fi

# Start the server with improved error handling
python3 app.py >> $log_file 2>&1 &
BACKEND_PID=$!
cd ..

# Record the start time for timeout calculation
start_time=$(date +%s)
max_wait=30  # Maximum seconds to wait

# Wait for backend to start and verify it's running
echo -e "${YELLOW}Verifying backend server status...${NC}"
started=false
attempt=1

while [ $(( $(date +%s) - start_time )) -lt $max_wait ]; do
    if check_backend_health; then
        echo -e "\n${GREEN}Backend server started successfully! (PID: $BACKEND_PID)${NC}"
        started=true
        break
    fi
    
    # Check if process is still running
    if ! ps -p $BACKEND_PID > /dev/null; then
        echo -e "\n${RED}Backend server process terminated unexpectedly.${NC}"
        echo -e "${YELLOW}Checking logs:${NC}"
        tail -5 backend_server.log
        
        # Try to restart once if it fails on first attempt
        if [ $attempt -eq 1 ]; then
            echo -e "${YELLOW}Attempting to restart backend server...${NC}"
            cd backend
            python3 app.py > ../backend_server.log 2>&1 &
            BACKEND_PID=$!
            cd ..
            attempt=2
            sleep 2
            continue
        else
            echo -e "${RED}Failed to start backend server after retry. Check backend_server.log for errors.${NC}"
            echo -e "${YELLOW}Starting frontend anyway, but AI features will not be available.${NC}"
            break
        fi
    fi
    
    echo -n "."
    sleep 1
done

# Final check if we timed out
if [ "$started" = false ]; then
    echo -e "\n${RED}Backend server health check timed out after ${max_wait} seconds.${NC}"
    
    # Check if process is actually running despite health endpoint not responding
    if ps -p $BACKEND_PID > /dev/null; then
        echo -e "${YELLOW}Process is still running (PID: $BACKEND_PID), but health endpoint is not responding.${NC}"
        echo -e "${YELLOW}Check backend_server.log for details. Continuing with frontend startup.${NC}"
    else
        echo -e "${RED}Backend process is not running. Check backend_server.log for errors.${NC}"
        echo -e "${YELLOW}Starting frontend anyway, but AI features will not be available.${NC}"
    fi
fi

# Start the frontend development server
echo -e "${GREEN}Starting the frontend application...${NC}"
echo -e "${BLUE}The editor will be available at: ${GREEN}http://localhost:3000${NC}"

# Function to handle termination
cleanup() {
    echo -e "${YELLOW}Stopping servers...${NC}"
    
    # Kill the backend process
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        wait $BACKEND_PID 2>/dev/null || true
    fi
    
    # Make doubly sure the port is freed
    if lsof -i:8000 >/dev/null 2>&1; then
        echo -e "${YELLOW}Ensuring backend server is stopped...${NC}"
        fuser -k 8000/tcp >/dev/null 2>&1
    fi
    
    echo -e "${GREEN}All servers stopped.${NC}"
    exit 0
}

# Set up the trap for SIGINT (Ctrl+C) and SIGTERM
trap cleanup INT TERM

# Start React frontend
npm start

# If npm start exits, clean up the backend as well
cleanup
