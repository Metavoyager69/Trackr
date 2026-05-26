import "server-only";

type RateLimitEntry = {
  attempts: number;
  firstAttemptAt: number;
};

const store = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000;

export function checkRateLimit(key: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  pruneExpiredEntries();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const windowExpiry = entry.firstAttemptAt + WINDOW_MS;

  if (now >= windowExpiry) {
    store.delete(key);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((windowExpiry - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordFailedAttempt(key: string) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.firstAttemptAt + WINDOW_MS) {
    store.set(key, { attempts: 1, firstAttemptAt: now });
    return;
  }

  entry.attempts += 1;
}

function pruneExpiredEntries() {
  const now = Date.now();

  for (const [key, entry] of store) {
    if (now >= entry.firstAttemptAt + WINDOW_MS) {
      store.delete(key);
    }
  }
}
