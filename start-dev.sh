#!/bin/bash
# Start both Convex backend and Vite frontend

echo "🔄 Stopping any existing dev servers..."
pkill -f "vite" 2>/dev/null
pkill -f "convex dev" 2>/dev/null
sleep 2

echo "🚀 Starting Convex backend and Vite frontend..."
cd "/Users/chaianun_fu/Downloads/Reveal 2.0"

# Start both in parallel using npm-run-all
npm run dev

echo "✅ Development servers started!"
echo ""
echo "Frontend: http://localhost:3002"
echo "Convex Dashboard: https://dashboard.convex.dev"

