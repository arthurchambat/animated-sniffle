import { fileURLToPath } from "node:url";
import path from "node:path";

// Load environment variables
import './load-env.mjs';

import { WorkerOptions, cli, defineAgent, AutoSubscribe, log } from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
// import * as bey from "@livekit/agents-plugin-bey";
import { RoomEvent } from "@livekit/rtc-node";

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineAgent({
  entry: async (ctx) => {
    // Connect to the room
    await ctx.connect(undefined, AutoSubscribe.SUBSCRIBE_ALL);

    console.log(`✅ Connected to room: ${ctx.room.name}`);

    // Wait for the first participant (the user)
    const participant = await ctx.waitForParticipant();
    console.log(`✅ Participant joined: ${participant.identity}`);

    // Initialize OpenAI for transcription and chat
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    console.log("✅ Initializing OpenAI Realtime with Voice Activity Detection");

    /* TEMPORARILY DISABLED - BeyondPresence integration needs fixing
    // Initialize BeyondPresence avatar
    const beyApiKey = process.env.BEYOND_PRESENCE_API_KEY;
    const beyAvatarId = process.env.BEY_AVATAR_ID;
    
    if (!beyApiKey || !beyAvatarId) {
      console.warn("⚠️  BeyondPresence credentials missing - avatar will not be displayed");
    } else {
      console.log(`Initializing BeyondPresence avatar: ${beyAvatarId}`);
      // Avatar integration to be added here
    }
    */

    // Configure the agent with Voice Activity Detection (VAD)
    const assistant = new openai.realtime.RealtimeModel({
      model: "gpt-4o-realtime-preview-2024-12-17",
      instructions: `You are a professional finance interviewer conducting a realistic job interview. 

CRITICAL RULES:
- You will ask EXACTLY 5 questions total, then conclude the interview
- After asking your 5th question and receiving the answer, say: "Thank you for your time. That concludes our interview. Good luck!"
- Number your questions mentally: Q1, Q2, Q3, Q4, Q5
- After each answer, ask the next question naturally
- DO NOT ask more than 5 questions under any circumstances

Interview Behavior:
- ALWAYS wait for the candidate to finish speaking before responding
- Listen actively and let silence happen - don't interrupt
- Ask thoughtful follow-up questions based on the candidate's answers
- Keep questions focused on finance, banking, consulting, or the specific role
- Be professional but friendly
- If the candidate is still speaking, wait for them to finish
- Use natural pauses to ensure the candidate has finished their thought

Question Types (ask 5 from these categories):
1. Opening: "Tell me about yourself and why you're interested in finance"
2. Technical: Market knowledge, financial concepts, case questions
3. Behavioral: Past experiences, teamwork, challenges
4. Analytical: Problem-solving scenarios
5. Closing: Questions for us, career goals

Remember: 5 questions total, then end. Good interviewers listen more than they speak.`,
      voice: "alloy",
      temperature: 0.8,
      turnDetection: {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 1000, // Wait 1 second of silence before responding
      },
    });

    // Start the session with the participant
    const session = assistant.session({
      room: ctx.room,
      participant: participant,
    });

    console.log("✅ OpenAI Realtime session started - agent is listening...");

    // Track conversation for question counting
    let questionCount = 0;
    let conversationLog = [];
    let hasEnded = false;
    let hasGreeted = false;

    // Monitor agent responses to count questions
    session.on("agent_speech_committed", async (message) => {
      if (hasEnded) return;

      const text = message.text || "";
      conversationLog.push({ role: "agent", text, timestamp: Date.now() });

      // Count questions (look for question marks or question-like patterns)
      if (text.includes("?") || /\b(tell me|what|why|how|when|where|describe|explain)\b/i.test(text)) {
        questionCount++;
        console.log(`📊 Question ${questionCount}/5 asked`);

        // Check if we've reached 5 questions
        if (questionCount >= 5) {
          console.log("✅ 5 questions completed - will end interview after next response");
        }
      }

      /* TEMPORARILY DISABLED - BeyondPresence integration
      // Send the audio to the avatar for lip-sync
      if (avatar && message.audio) {
        await avatar.say(message.audio);
      }
      */
    });

    // Track user responses
    session.on("user_speech_committed", async (message) => {
      if (hasEnded) return;

      const text = message.text || "";
      conversationLog.push({ role: "user", text, timestamp: Date.now() });
      console.log(`👤 User response: ${text.substring(0, 50)}...`);
      
      // Auto-greet and start interview if this is the first user speech
      if (!hasGreeted && questionCount === 0) {
        hasGreeted = true;
        console.log("🎤 First user activity detected, interview starting...");
      }

      // If we've had 5 questions and user just responded, end the interview
      if (questionCount >= 5 && !hasEnded) {
        hasEnded = true;
        console.log("🎬 Interview complete - 5 questions answered");
        
        // Send completion signal via data channel
        try {
          const dataPacket = {
            type: "interview_complete",
            questionCount,
            conversationLog,
            timestamp: Date.now(),
          };
          
          // Publish data to room
          await ctx.room.localParticipant.publishData(
            new TextEncoder().encode(JSON.stringify(dataPacket)),
            { reliable: true }
          );
          
          console.log("📤 Sent interview completion signal to client");
        } catch (error) {
          console.error("❌ Failed to send completion signal:", error);
        }
      }
    });

    // Handle room events
    ctx.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log(`❌ Participant left: ${participant.identity}`);
    });

    console.log("🎙️  Finance Interview Agent is ready and responsive!");
  },
});

// Start the worker
cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: process.env.LIVEKIT_AGENT_NAME || "finance-coach-avatar",
  })
);
