#!/bin/bash

# Docker build and run script for Event Analytics Application

echo "🐳 Building Event Analytics Docker Image..."

# Build the Docker image
docker build -t event-analytics:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo ""
    echo "🚀 Starting the application with Docker Compose..."
    
    # Start the application with docker-compose
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        echo "✅ Application started successfully!"
        echo ""
        echo "📊 Your application is now running at:"
        echo "   Frontend: http://localhost:5000"
        echo "   API Docs: http://localhost:5000/docs"
        echo "   Health Check: http://localhost:5000/health"
        echo ""
        echo "🗄️  PostgreSQL Database:"
        echo "   Host: localhost"
        echo "   Port: 5432"
        echo "   Database: analytics_db"
        echo "   Username: analytics_user"
        echo "   Password: anasbentalouba"
        echo ""
        echo "📝 Useful commands:"
        echo "   View logs: docker-compose logs -f"
        echo "   Stop services: docker-compose down"
        echo "   Restart services: docker-compose restart"
    else
        echo "❌ Failed to start the application with Docker Compose"
        exit 1
    fi
else
    echo "❌ Failed to build Docker image"
    exit 1
fi 