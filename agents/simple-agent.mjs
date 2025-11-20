import { fileURLToPath } from "node:url";
import path from "node:path";

// Load environment variables
import './load-env.mjs';

import { WorkerOptions, cli, defineAgent, AutoSubscribe, log } from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import { RoomEvent } from "@livekit/rtc-node";

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineAgent({
  entry: async (ctx) => {
    // Connect to the room
    await ctx.connect(undefined, AutoSubscribe.SUBSCRIBE_ALL);

    log.info(`Connected to room: ${ctx.room.name}`);

    // Wait for the first participant (the user)
    const participant = await ctx.waitForParticipant();
    log.info(`Participant joined: ${participant.identity}`);

    // Initialize OpenAI for transcription and chat
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    log.info("Initializing OpenAI Realtime with Voice Activity Detection");

    // Configure the agent with Voice Activity Detection (VAD)
    const assistant = new openai.realtime.RealtimeModel({
      model: "gpt-4o-realtime-preview-2024-12-17",
      instructions: `You are a professional finance interviewer conducting a realistic job interview. 

Key behaviors:
- ALWAYS wait for the candidate to finish speaking before responding
- Listen actively and let silence happen - don't interrupt
- Ask thoughtful follow-up questions based on the candidate's answers
- Keep questions focused on finance, banking, consulting, or the specific role
- Be professional but friendly
- If the candidate is still speaking, wait for them to finish
- Use natural pauses to ensure the candidate has finished their thought

Remember: Good interviewers listen more than they speak.`,
      voice: "alloy",
      temperature: 0.8,
      turnDetection: {
        type: "server_vad",
        threshold: 0.5,
        prefixPaddingMs: 300,
        silenceDurationMs: 1000, // Wait 1 second of silence before responding
      },
    });

    // Start the session with the participant
    const session = assistant.session({
      room: ctx.room,
      participant: participant,
    });

    log.info("OpenAI Realtime session started - waiting for audio...");

    // Handle room events
    ctx.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      log.info(`Participant left: ${participant.identity}`);
    });

    log.info("Finance Interview Agent started successfully!");
  },
});

// Start the worker if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cli.runApp(
    new WorkerOptions({
      agent: fileURLToPath(import.meta.url),
      agentName: process.env.LIVEKIT_AGENT_NAME || "finance-coach-audio",
    })
  );
}
