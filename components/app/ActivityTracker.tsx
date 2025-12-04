"use client";

import { useActivityTracker } from "@/lib/gamification/useActivityTracker";

/**
 * Client component to track user activity in the app layout
 */
export function ActivityTracker() {
  useActivityTracker();
  return null;
}
