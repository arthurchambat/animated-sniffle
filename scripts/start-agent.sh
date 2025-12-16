#!/bin/bash

echo "🎤 Starting AI Voice Interview Agent..."
echo ""
echo "Prerequisites checklist:"
echo "✓ LiveKit credentials configured in .env.local"
echo "✓ OpenAI API key with GPT-4 Realtime access"
echo ""
echo "The agent will:"
echo "  1. Connect to your LiveKit server"
echo "  2. Listen for interview participants"
echo "  3. Ask 5 questions using OpenAI voice"
echo "  4. Automatically end after 5 questions"
echo ""
echo "Starting agent..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$(dirname "$0")/.."
node agents/livekit-agent.mjs
