// Minimal Cookie header parser - all the app needs is to read one cookie,
// so this avoids pulling in cookie-parser.
export function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (!name || name in out) continue;
    const raw = part.slice(eq + 1).trim();
    try {
      out[name] = decodeURIComponent(raw);
    } catch {
      out[name] = raw;
    }
  }
  return out;
}

// "7d" / "12h" / "30m" / "45s" / plain seconds -> milliseconds. Same units
// jsonwebtoken accepts for expiresIn, so the cookie can live exactly as long
// as the token inside it.
export function durationToMs(value) {
  if (typeof value === 'number') return value * 1000;
  const match = /^(\d+)\s*([smhd])?$/.exec(String(value).trim());
  if (!match) throw new Error(`Unsupported duration: ${value}`);
  const n = Number(match[1]);
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2] ?? 's'];
  return n * unit;
}
