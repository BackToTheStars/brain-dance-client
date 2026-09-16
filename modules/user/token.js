// The payload is base64url-encoded UTF-8 JSON: plain atob throws on '-' and '_'
// and turns a Cyrillic nickname into mojibake.
export const readTokenPayload = (token) => {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = part.padEnd(Math.ceil(part.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (err) {
    return null;
  }
};

// ms, both ends stamped by the server; null for a token that cannot be read.
const renewalDueAt = (token) => {
  const { iat, exp } = readTokenPayload(token) || {};
  if (!Number.isFinite(iat) || !Number.isFinite(exp) || exp <= iat) return null;
  return ((iat + exp) / 2) * 1000;
};

// Half of the lifetime. A token that cannot be read is due as well: the
// refresh answer is the verdict on it.
export const isRenewalDue = (token, now = Date.now()) => {
  const dueAt = renewalDueAt(token);
  return dueAt === null || now >= dueAt;
};

// setTimeout's delay is a 32-bit signed int: above it fires immediately
// instead of waiting. A token good for months is rechecked in stages.
export const MAX_TIMER_DELAY_MS = 2147483647;

// A token still due after a check means no verdict (network, 5xx); with no floor
// the timer retried at once, about 380 refresh requests a second.
export const RENEWAL_RETRY_MS = 30 * 1000;

// Delay before the next timed check: until half of the lifetime, capped for
// setTimeout; a token already due or unreadable waits RENEWAL_RETRY_MS.
export const renewalDelayMs = (token, now = Date.now()) => {
  const dueAt = renewalDueAt(token);
  if (dueAt === null || dueAt <= now) return RENEWAL_RETRY_MS;
  return Math.min(dueAt - now, MAX_TIMER_DELAY_MS);
};
