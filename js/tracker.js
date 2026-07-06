/**
 * tracker.js — Visitor Analytics Tracker
 * Collects visit data (platform, geo, browser) and sends to Supabase site_visits table.
 * - Runs once per session (sessionStorage flag)
 * - IP is hashed with SHA-256 — raw IP never stored (GDPR-friendly)
 * - Geo lookup via ipapi.co (1000 req/day free)
 * - Graceful fallback if geo API is unavailable
 */

(async function initTracker() {
  // Run only once per browser session
  if (sessionStorage.getItem('_tracked')) return;
  sessionStorage.setItem('_tracked', '1');

  const { url, anonKey } = (window.SITE_CONFIG && window.SITE_CONFIG.supabase) || {};
  if (!url || !anonKey || url.includes('YOUR_PROJECT_ID')) return;

  // ── 1. Session ID (unique per tab session) ──────────────────────────────
  const sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

  // ── 2. Platform / Browser / OS from User-Agent ──────────────────────────
  function detectPlatform() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
    if (/mobi|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return 'Mobile';
    return 'Desktop';
  }

  function detectBrowser() {
    const ua = navigator.userAgent;
    if (/edg\//i.test(ua))             return 'Edge';
    if (/opr\//i.test(ua))             return 'Opera';
    if (/chrome\/[\d.]+/i.test(ua) && !/chromium/i.test(ua)) return 'Chrome';
    if (/firefox\/[\d.]+/i.test(ua))   return 'Firefox';
    if (/safari\/[\d.]+/i.test(ua))    return 'Safari';
    return 'Other';
  }

  function detectOS() {
    const ua = navigator.userAgent;
    if (/windows/i.test(ua))           return 'Windows';
    if (/iphone|ipad|ipod/i.test(ua))  return 'iOS';
    if (/mac os x/i.test(ua))          return 'macOS';
    if (/android/i.test(ua))           return 'Android';
    if (/linux/i.test(ua))             return 'Linux';
    return 'Other';
  }

  // ── 3. SHA-256 hash of IP (privacy-preserving unique visitor count) ─────
  async function hashText(text) {
    try {
      const data = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      return null;
    }
  }

  // ── 4. Geo lookup via ipapi.co ──────────────────────────────────────────
  async function getGeoData() {
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return {};
      const data = await res.json();
      return {
        country:      data.country_name  || null,
        city:         data.city          || null,
        country_code: data.country_code  || null,
        ip_raw:       data.ip            || null,
      };
    } catch {
      return {};
    }
  }

  // ── 5. Collect & send ───────────────────────────────────────────────────
  try {
    const geo = await getGeoData();
    const ipHash = geo.ip_raw ? await hashText(geo.ip_raw) : null;

    const payload = {
      country:      geo.country      || null,
      city:         geo.city         || null,
      country_code: geo.country_code || null,
      platform:     detectPlatform(),
      browser:      detectBrowser(),
      os:           detectOS(),
      referrer:     document.referrer ? document.referrer.slice(0, 200) : null,
      session_id:   sessionId,
      ip_hash:      ipHash,
    };

    await fetch(`${url}/rest/v1/site_visits`, {
      method:  'POST',
      headers: {
        'apikey':        anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Silent fail — tracking should never break the site
    console.debug('[Tracker] Visit not recorded:', err.message);
  }
})();
