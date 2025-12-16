# 🔧 Voice Interview Troubleshooting Guide

## Issue 1: "RPC did not return feedback_id" Error

### Problem
When you click "End Interview" or hang up, you get an error about feedback_id.

### Diagnosis
The database RPC function `complete_interview_session` might not exist or is not returning data in the expected format.

### Solution Steps

**Step 1: Check if the RPC function exists in your database**

Go to your Supabase Dashboard → SQL Editor and run:

```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'complete_interview_session';
```

**Step 2: If it doesn't exist, create it**

Run the migration file:

```bash
# From your project root
cat supabase/migrations/complete_interview_session.sql
```

Then copy that SQL and run it in Supabase SQL Editor.

**Step 3: Test the function manually**

```sql
-- Replace the UUID with an actual interview session ID from your database
SELECT * FROM complete_interview_session(
  'your-session-id-here'::uuid,
  'Test feedback',
  ARRAY['Good point 1', 'Good point 2'],
  ARRAY['Improve 1', 'Improve 2'],
  '[]'::jsonb,
  75
);
```

**Step 4: Check the server logs**

After the next time you try to end an interview, check your terminal running `npm run dev` for:
```
[completeInterviewSession] RPC returned: {...}
```

This will show you what format the data is actually in.

---

## Issue 2: AI Does Not Talk to Me

### Problem
You activate Voice Mode but the AI doesn't ask any questions.

### Root Cause
The voice agent backend is not running! The agent is a separate process that needs to be started.

### Solution

**Step 1: Open a NEW terminal window** (keep your `npm run dev` running in the first one)

**Step 2: Start the voice agent:**

```bash
cd /Users/arthur/Documents/HEC/X\ HEC\ Entrepreneur/Electifs/AI_Prod/FinanceCoach
npm run agent
```

Or use the script:
```bash
./scripts/start-agent.sh
```

**Step 3: Look for these success messages:**

```
✅ Connected to room: financebro-bey-xxxxx
✅ Participant joined: financebro-viewer-xxxxx
✅ Initializing OpenAI Realtime with Voice Activity Detection
✅ OpenAI Realtime session started - agent is listening...
🎙️  Finance Interview Agent is ready and responsive!
```

**Step 4: Now try Voice Mode again in your browser**

1. Refresh the interview page
2. Click "Voice Mode (Beta)"
3. Allow microphone access
4. Wait 2-3 seconds
5. The AI should greet you and ask the first question!

### Common Agent Startup Errors

**Error: "OPENAI_API_KEY environment variable is required"**
```bash
# Add to your .env.local file:
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

**Error: "Connection failed" or "Invalid credentials"**
```bash
# Check your LiveKit credentials in .env.local:
LIVEKIT_URL=wss://financebro-h5cfu3wl.livekit.cloud
LIVEKIT_API_KEY=APIm4bvadgGonBB
LIVEKIT_API_SECRET=tCCSLeYpiwRLMYBHSco1bmwIMqucbTfuHLhD6fq06ZoA
```

---

## Issue 3: Not Sure if AI is Listening

### How to Verify the AI is Listening

**Visual Indicators:**

1. **Status Badge:**
   - 🔴 Idle (gray) = Not connected
   - 🔵 Connecting (blue, spinning) = Trying to connect
   - 🟢 Listening (green, pulse) = **AI IS LISTENING** ✓
   - 🔵 Speaking (blue, pulse) = AI is talking

2. **Check the transcript area:**
   - Messages should appear as you and the AI speak
   - User messages in emerald color
   - AI messages in blue color

3. **Browser console (F12):**
   ```
   [VoiceAgent] Connected to room: financebro-bey-xxxxx
   [VoiceAgent] Agent audio track subscribed
   [VoiceAgent] Voice agent ready
   ```

### Agent-Side Verification

In the terminal running the agent (`npm run agent`), you should see:

```
👤 User response: Tell me about your...
📊 Question 1/5 asked
👤 User response: I have experience in...
📊 Question 2/5 asked
```

### Audio Debugging

**Test your microphone:**
```bash
# Visit in Chrome/Edge:
chrome://settings/content/microphone
```

Make sure:
- ✅ Microphone permission granted to localhost:3000
- ✅ Correct microphone selected (not "System Default")
- ✅ Test recording works

**Test your speakers/headphones:**
- Play a YouTube video
- Verify volume is up
- Try different browser if needed (Chrome/Edge recommended)

### Network Debugging

**Check LiveKit connection:**

Open browser console (F12) → Network tab → Filter: WS

You should see:
```
wss://financebro-h5cfu3wl.livekit.cloud
Status: 101 (Switching Protocols) ← This means connected! ✓
```

---

## Complete Checklist for Voice Interview

Before starting an interview, verify:

### Backend Running
- [ ] Terminal 1: `npm run dev` running
- [ ] Terminal 2: `npm run agent` running and shows "Finance Interview Agent is ready"

### Environment Variables
- [ ] `.env.local` exists with LiveKit credentials
- [ ] OPENAI_API_KEY is set and valid
- [ ] LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET all set

### Browser Setup
- [ ] Using Chrome or Edge (best compatibility)
- [ ] Microphone permission granted
- [ ] Volume/speakers working
- [ ] Network tab shows WebSocket connection to LiveKit

### During Interview
- [ ] Click "Voice Mode (Beta)"
- [ ] Status shows "Listening" (green pulse)
- [ ] AI greets you within 3-5 seconds
- [ ] Your voice shows activity in browser mic indicator
- [ ] Transcript shows messages appearing

---

## Quick Test Procedure

**1. Start both servers:**
```bash
# Terminal 1
npm run dev

# Terminal 2 (new window)
npm run agent
```

**2. Create and start interview:**
- Go to http://localhost:3000/interview/new
- Use defaults, click "Start Interview"

**3. Activate voice:**
- Click "Voice Mode (Beta)"
- Allow mic
- Status → green "Listening"

**4. Say:**
> "Hello, can you hear me?"

**5. Expected response within 5 seconds:**
> "Yes, I can hear you clearly! Let me start with the first question. Tell me about yourself and why you're interested in finance?"

**6. The AI will ask 5 questions total, then automatically end the interview.**

---

## Still Not Working?

### Get Detailed Logs

**Server logs (Terminal 1):**
```bash
npm run dev
# Watch for [VoiceAgent] messages and errors
```

**Agent logs (Terminal 2):**
```bash
npm run agent
# Watch for ✅ success messages and 📊 question counts
```

**Browser logs (F12 Console):**
```javascript
// Look for errors in red
// Filter for: livekit, voice, agent
```

### Report the Issue

If still stuck, provide:
1. Output from `npm run agent` (first 50 lines)
2. Browser console errors (screenshot)
3. Output from ending interview (the RPC data logged)

---

## Success Indicators

You know it's working when:

✅ Agent terminal shows "🎙️ Finance Interview Agent is ready and responsive!"
✅ Browser status shows "Listening" with green pulse
✅ AI voice asks you a question within 5 seconds
✅ Transcript shows your responses
✅ After 5 questions, interview auto-ends
✅ You're redirected to feedback page

---

## Emergency Reset

If everything is broken:

```bash
# Stop all processes
killall node

# Clear cache
rm -rf .next

# Restart everything
npm run dev         # Terminal 1
npm run agent       # Terminal 2

# Hard refresh browser
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```
