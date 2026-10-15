// Simple in-memory rate limiter for server route handlers
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60 * 60 * 1000 // 1 hour window
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier) || { timestamps: [] };

  // Filter out timestamps outside window
  const validTimestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= limit) {
    const oldest = validTimestamps[0];
    const resetMs = windowMs - (now - oldest);
    return { allowed: false, remaining: 0, resetMs };
  }

  validTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: validTimestamps });

  return {
    allowed: true,
    remaining: limit - validTimestamps.length,
    resetMs: windowMs,
  };
}
