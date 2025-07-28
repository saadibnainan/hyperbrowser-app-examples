import { Hyperbrowser } from "@hyperbrowser/sdk";

interface CachedSession {
  id: string;
  created: number;
  lastUsed: number;
  inUse: boolean;
}

// Global session cache for performance
const sessionCache = new Map<string, CachedSession>();
const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes
const SESSION_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Get or create a reusable Hyperbrowser session for SPEED
 */
export async function getSession(hb: Hyperbrowser): Promise<string> {
  const now = Date.now();
  
  // Try to reuse existing session
  for (const [sessionId, session] of sessionCache.entries()) {
    if (!session.inUse && (now - session.lastUsed) < SESSION_TIMEOUT) {
      session.inUse = true;
      session.lastUsed = now;
      console.log(`♻️ Reusing session: ${sessionId}`);
      return sessionId;
    }
  }
  
  // Create new session if none available
  console.log(`🆕 Creating new session...`);
  const newSession = await hb.sessions.create({});
  
  sessionCache.set(newSession.id, {
    id: newSession.id,
    created: now,
    lastUsed: now,
    inUse: true
  });
  
  return newSession.id;
}

/**
 * Release session back to pool
 */
export function releaseSession(sessionId: string): void {
  const session = sessionCache.get(sessionId);
  if (session) {
    session.inUse = false;
    session.lastUsed = Date.now();
    console.log(`🔓 Released session: ${sessionId}`);
  }
}

/**
 * Cleanup expired sessions
 */
export async function cleanupSessions(hb: Hyperbrowser): Promise<void> {
  const now = Date.now();
  
  for (const [sessionId, session] of sessionCache.entries()) {
    if ((now - session.lastUsed) > SESSION_TIMEOUT) {
      try {
        await hb.sessions.stop(sessionId);
        sessionCache.delete(sessionId);
        console.log(`🧹 Cleaned up expired session: ${sessionId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to cleanup session ${sessionId}:`, error);
        sessionCache.delete(sessionId); // Remove from cache anyway
      }
    }
  }
}

// Auto-cleanup every 5 minutes
setInterval(async () => {
  if (sessionCache.size > 0) {
    // Note: We'd need the hb instance here, but for now just log
    console.log(`🧹 Auto-cleanup: ${sessionCache.size} sessions in cache`);
  }
}, SESSION_CLEANUP_INTERVAL); 