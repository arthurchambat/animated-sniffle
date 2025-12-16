# LiveKit Voice Agent Setup Guide

## Quick Start

### Step 1: Get LiveKit Credentials

**Option A: LiveKit Cloud (Recommended)**
1. Go to https://cloud.livekit.io/
2. Sign up for a free account
3. Create a new project
4. Copy your credentials:
   - WebSocket URL (starts with `wss://`)
   - API Key (starts with `API`)
   - API Secret (long string)

**Option B: Self-Hosted LiveKit**
1. Follow https://docs.livekit.io/home/self-hosting/deployment/
2. Get your server's WebSocket URL
3. Generate API key and secret

### Step 2: Create Environment File

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your real credentials:
   ```bash
   # Replace these with your actual LiveKit credentials
   LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=APIxxxxxxxxxx
   LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   
   # Add your OpenAI API key
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test Voice Agent

1. Go to http://localhost:3000
2. Create a new interview
3. Click "Start Interview"
4. Click "Voice Mode (Beta)" button
5. Allow microphone access
6. Start speaking!

## Troubleshooting

### Error: "LiveKit is not configured"
- ✅ Make sure `.env.local` exists in project root
- ✅ Check that all three LIVEKIT_ variables are set
- ✅ Restart the dev server after adding variables
- ✅ Verify no typos in variable names

### Error: "Failed to connect to LiveKit"
- ✅ Check that LIVEKIT_URL starts with `wss://`
- ✅ Verify your LiveKit server is running
- ✅ Check API key and secret are correct
- ✅ Make sure your LiveKit project is active

### Microphone Not Working
- ✅ Allow microphone permission in browser
- ✅ Check browser console for errors
- ✅ Try different browser (Chrome/Edge work best)
- ✅ Verify microphone works in other apps

### Agent Not Responding
- ✅ Make sure OPENAI_API_KEY is set
- ✅ Check you have OpenAI API credits
- ✅ Verify the agent backend is running (see below)
- ✅ Check browser console and server logs

## Running the Voice Agent Backend (Optional)

For the agent to respond with AI:

```bash
# In a separate terminal
cd agents
node livekit-agent.mjs
```

**Note:** The agent backend requires:
- Node.js 18+
- OpenAI API key with access to GPT-4 Realtime API
- Active LiveKit connection

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `LIVEKIT_URL` | ✅ Yes | WebSocket URL (wss://...) |
| `LIVEKIT_API_KEY` | ✅ Yes | API key from LiveKit |
| `LIVEKIT_API_SECRET` | ✅ Yes | API secret from LiveKit |
| `OPENAI_API_KEY` | ✅ Yes | OpenAI API key |
| `LIVEKIT_AGENT_NAME` | ❌ No | Agent name (default: finance-coach-avatar) |
| `BEYOND_PRESENCE_API_KEY` | ❌ No | BeyondPresence API key |
| `BEY_AVATAR_ID` | ❌ No | BeyondPresence avatar ID |

## Next Steps

Once configured:
1. ✅ Voice agent will connect automatically
2. ✅ Real-time audio streaming will work
3. ✅ Transcripts will appear in the UI
4. ✅ You can have full voice conversations with the AI interviewer

For more details, see `VOICE_AGENT_INTEGRATION.md`
