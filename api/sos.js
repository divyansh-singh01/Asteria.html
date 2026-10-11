// Vercel serverless function: sends SOS SMS to emergency contacts via Twilio.
// Credentials live in environment variables, never in the browser.
const PHONE = /^\+[0-9]{10,15}$/;
const hits = new Map(); // best-effort per-instance rate limit

function limited(ip) {
  const now = Date.now(), recent = (hits.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  if (recent.length >= 3) { hits.set(ip, recent); return true; }
  recent.push(now); hits.set(ip, recent); return false;
}
function toE164(raw) {
  let p = String(raw || '').replace(/[\s\-().]/g, '');
  if (!p.startsWith('+')) p = (process.env.DEFAULT_COUNTRY_CODE || '+91') + p.replace(/^0+/, '');
  return PHONE.test(p) ? p : null;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const allowed = process.env.ALLOWED_ORIGIN; // e.g. https://your-app.vercel.app
  if (allowed && req.headers.origin !== allowed) return res.status(403).json({ error: 'forbidden_origin' });
  const sid = process.env.TWILIO_ACCOUNT_SID, token = process.env.TWILIO_AUTH_TOKEN, from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) return res.status(503).json({ error: 'sms_not_configured' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ error: 'rate_limited' });

  let b = req.body; try { if (typeof b === 'string') b = JSON.parse(b); } catch (e) { b = null; }
  if (!b || typeof b !== 'object') return res.status(400).json({ error: 'bad_request' });
  const contacts = [...new Set((Array.isArray(b.contacts) ? b.contacts : []).map(toE164).filter(Boolean))].slice(0, 3);
  if (!contacts.length) return res.status(400).json({ error: 'no_valid_contacts' });
  const name = String(b.name || 'Someone').replace(/[^\p{L}\p{M} .'-]/gu, '').slice(0, 60) || 'Someone';
  const loc = /^https:\/\/www\.google\.com\/maps\?q=-?[0-9.]+,-?[0-9.]+$/.test(String(b.location_url || '')) ? b.location_url : '';
  const battery = String(b.battery || '').replace(/[^0-9%A-Za-z .]/g, '').slice(0, 12);
  const text = `EMERGENCY SOS from ${name}. They need immediate help.` + (loc ? ` Live location: ${loc}` : '') + (battery ? ` Battery: ${battery}` : '');

  const auth = 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64');
  const results = await Promise.allSettled(contacts.map(async to => {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ To: to, From: from, Body: text }).toString()
    });
    if (!r.ok) throw new Error('twilio_' + r.status);
  }));
  const sent = results.filter(r => r.status === 'fulfilled').length;
  return res.status(sent ? 200 : 502).json({ sent, failed: results.length - sent });
};
