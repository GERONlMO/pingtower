#!/bin/bash
set -e

# Start Xvfb
Xvfb :99 -screen 0 1280x1024x24 > /dev/null 2>&1 &

# Wait for Xvfb to start
sleep 1

# Start Java application
exec java -jar app.jar

