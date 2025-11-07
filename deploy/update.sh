#!/bin/bash

# Script Vars
REPO_URL="https://github.com/quochuydev/x-app-v1.git"
APP_DIR=~/myapp
BRANCH=${1:-"main"}

echo "Branch: $BRANCH"

# Pull the latest changes from the Git repository
if [ -d "$APP_DIR" ]; then
  echo "🔄 Updating existing app directory..."
  cd "$APP_DIR"

  git fetch origin $BRANCH

  echo "⚙️ Resetting local branch to remote state..."
  git reset --hard origin/$BRANCH

  echo "✅ Repository synced to latest remote commit."
else
  echo "Cloning repository from $REPO_URL..."
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi

git checkout $BRANCH

# Build and restart the Docker containers from the app directory (~/myapp)
echo "Rebuilding and restarting Docker containers..."
sudo docker-compose down
sudo docker-compose up --build -d

# Check if Docker Compose started correctly
if ! sudo docker-compose ps | grep "Up"; then
  echo "Docker containers failed to start. Check logs with 'docker-compose logs'."
  exit 1
fi

# Output final message
echo "Update complete. Your Next.js app has been deployed with the latest changes."

