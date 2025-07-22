#!/bin/bash

# Development Setup Script for Mingle
# This script helps manage port conflicts and development server startup

echo "🚀 Mingle Development Setup"

# Function to check if port is in use
check_port() {
    if lsof -Pi :8136 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port 8136 is in use. Killing existing processes..."
        lsof -ti:8136 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to kill all Vite processes
kill_vite() {
    echo "🧹 Cleaning up Vite processes..."
    pkill -f "vite\|npm run dev" 2>/dev/null || true
    sleep 1
}

# Function to start development server
start_dev() {
    echo "🎯 Starting development server..."
    npm run dev
}

# Main execution
case "${1:-dev}" in
    "dev")
        check_port
        start_dev
        ;;
    "clean")
        kill_vite
        check_port
        start_dev
        ;;
    "force")
        kill_vite
        check_port
        echo "💪 Force starting development server..."
        npm run dev:force
        ;;
    "kill")
        kill_vite
        check_port
        echo "✅ All processes killed"
        ;;
    *)
        echo "Usage: $0 [dev|clean|force|kill]"
        echo "  dev   - Start dev server (default)"
        echo "  clean - Kill processes and start clean"
        echo "  force - Force kill all and restart"
        echo "  kill  - Just kill all processes"
        exit 1
        ;;
esac 