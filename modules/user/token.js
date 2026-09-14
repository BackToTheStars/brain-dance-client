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

// Half of the lifetime, both ends stamped by the server. A token that cannot be
// read is due as well: the refresh answer is the verdict on it.
export const isRenewalDue = (token, now = Date.now()) => {
  const { iat, exp } = readTokenPayload(token) || {};
  if (!Number.isFinite(iat) || !Number.isFinite(exp) || exp <= iat) return true;
  return now >= ((iat + exp) / 2) * 1000;
};
