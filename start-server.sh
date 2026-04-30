#!/bin/bash
# Standard Dictionary - Local HTTP Server
# Run this script to start a local web server for testing

cd "$(dirname "$0")"

echo "📚 Standard Dictionary - Local Server"
echo "======================================"
echo ""
echo "Starting HTTP server on http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 8080
