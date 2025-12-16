# AI Voice Interview - Quick Start Guide

## 🚀 How to Run the AI Voice Interviewer

### Prerequisites
✅ LiveKit credentials configured in `.env.local`
✅ OpenAI API key with access to GPT-4 Realtime API
✅ Node.js 18+ installed

### Step 1: Start the Voice Agent Backend

Open a **new terminal window** and run:

```bash
cd agents
node livekit-agent.mjs
```

You should see:
```
✅ Connected to room: financebro-bey-xxxxx
✅ Participant joined: financebro-viewer-xxxxx
✅ OpenAI Realtime session started - agent is listening...
🎙️  Finance Interview Agent is ready and responsive!
```

### Step 2: Start Your Next.js App (if not running)

In another terminal:

```bash
npm run dev
```

### Step 3: Start an Interview

1. Go to http://localhost:3000
2. Click "New Interview" or navigate to "Mes Entretiens"
3. Create a new interview (use default "No preference" values)
4. Click "Start Interview"

### Step 4: Activate Voice Mode

1. On the interview screen, click **"Voice Mode (Beta)"**
2. Allow microphone access when prompted
3. Wait for status to show **"Listening"** (green)
4. Start speaking!

## 🎯 How It Works

### The AI Interviewer Will:
1. **Ask 5 questions total** about finance, your background, and experience
2. **Listen actively** and wait for you to finish speaking
3. **Ask follow-up questions** based on your answers
4. **Automatically end** the interview after 5 questions
5. **Generate a feedback report** with analysis

### Interview Flow:
```
Start Voice → AI asks Q1 → You answer → AI asks Q2 → You answer → ... 
→ Q5 answered → "Thank you, that concludes our interview" → Auto-end → Feedback Report
```

## 📊 What You'll See

### Status Indicators:
- **Idle** (gray): Voice not started
- **Connecting** (blue, spinning): Connecting to server
- **Listening** (green, pulse): AI is listening to you
- **Speaking** (blue, pulse): AI is responding
- **Disconnected** (gray): Voice ended

### After 5 Questions:
- ✅ Toast notification: "Interview completed! The AI asked 5 questions."
- ✅ Auto-redirect to feedback page after 3 seconds
- ✅ Feedback report with AI analysis

## 🛠️ Troubleshooting

### Agent Not Responding?
```bash
# Check agent logs in the terminal
# Should see "agent_speech_committed" events
# If not, check OPENAI_API_KEY is valid
```

### Connection Issues?
```bash
# Restart the agent:
# Ctrl+C in agent terminal
cd agents
node livekit-agent.mjs
```

### No Audio?
- Check microphone permissions in browser
- Verify speaker volume is up
- Try Chrome/Edge (best compatibility)

## 🎓 Tips for Best Experience

### As the Candidate:
- ✅ Speak clearly and naturally
- ✅ Wait for the AI to finish before responding
- ✅ Take your time - the AI waits 1 second of silence before responding
- ✅ Answer thoughtfully - the AI tracks your conversation for feedback

### Common Questions the AI Might Ask:
1. "Tell me about yourself and why you're interested in finance"
2. Technical questions about markets, finance concepts
3. Behavioral questions about past experiences
4. Problem-solving scenarios
5. Career goals and questions for the interviewer

## 📝 What Happens Next?

After the interview completes:
1. **Automatic Processing**: The conversation is analyzed
2. **Feedback Generation**: AI creates detailed feedback
3. **Score Calculation**: Overall performance score (0-100)
4. **Report Available**: View your feedback in "Mes Feedbacks"

The feedback includes:
- ✅ General assessment
- ✅ What went well
- ✅ Areas to improve
- ✅ Per-question analysis
- ✅ Overall score

## 🔧 Advanced Configuration

### Modify Interview Behavior

Edit `agents/livekit-agent.mjs` to change:
- Number of questions (currently 5)
- AI personality/instructions
- Voice model (alloy, echo, fable, onyx, nova, shimmer)
- Turn detection sensitivity

### Environment Variables

Required in `.env.local`:
```bash
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=APIxxxxxx
LIVEKIT_API_SECRET=xxxxxx
OPENAI_API_KEY=sk-xxxxxx
```

## 🎉 You're Ready!

Start the agent, activate voice mode, and have a conversation with your AI interviewer!

For more details, see:
- `VOICE_AGENT_INTEGRATION.md` - Technical implementation
- `LIVEKIT_SETUP.md` - LiveKit configuration
- `AGENT_AUDIO_READY.md` - Audio setup guide
