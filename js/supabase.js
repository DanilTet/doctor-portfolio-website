/**
 * supabase.js — Supabase Integration
 * Fetches appointment count from Supabase REST API (no SDK needed)
 * Works with the static site — uses the public anon key + REST API
 */

/**
 * Fetches the total number of appointments from Supabase
 * @returns {Promise<number|null>} count or null on error
 */
async function fetchAppointmentCount() {
  const { url, anonKey, appointmentsTable, dateColumn, countFrom } = SITE_CONFIG.supabase;

  // If credentials are not configured yet — return null
  if (!url || url.includes('YOUR_PROJECT_ID') || !anonKey || anonKey.includes('YOUR_ANON_KEY')) {
    console.info('[Supabase] Credentials not configured yet — using static fallback.');
    return null;
  }

  try {
    // Use Supabase REST API with HEAD request to get count efficiently
    const endpoint = `${url}/rest/v1/${appointmentsTable}`;
    const params = new URLSearchParams({
      select: 'id',
      [`${dateColumn}`]: `gte.${countFrom}`,
    });

    const response = await fetch(`${endpoint}?${params}`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Prefer': 'count=exact',
        // Only fetch count metadata, not actual data
        'Range-Unit': 'items',
        'Range': '0-0',
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
    }

    // Parse count from Content-Range header: "0-0/COUNT"
    const contentRange = response.headers.get('Content-Range');
    if (contentRange) {
      const total = contentRange.split('/')[1];
      if (total && total !== '*') {
        return parseInt(total, 10);
      }
    }

    // Fallback: count the returned items
    const data = await response.json();
    return Array.isArray(data) ? data.length : null;

  } catch (error) {
    console.warn('[Supabase] Failed to fetch appointment count:', error.message);
    return null;
  }
}


/**
 * Initializes the patient count stat with Supabase data or fallback
 */
async function initPatientCount() {
  const { patientsFromSupabase, patientsStaticCount } = SITE_CONFIG.stats;
  const statEl = document.getElementById('stat-patients');
  if (!statEl) return;

  // Show loading state
  statEl.textContent = '...';

  let count = null;

  if (patientsFromSupabase) {
    count = await fetchAppointmentCount();
  }

  // Use static fallback if Supabase is unavailable or not configured
  if (count === null) {
    count = patientsStaticCount;
  }

  // Animate the counter to the final value
  animateCounter(statEl, 0, count, 1800);
}


/**
 * Animates a counter from start to end value
 */
function animateCounter(element, start, end, duration) {
  if (!element) return;

  const startTime = performance.now();
  const range = end - start;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + range * eased);

    element.textContent = current.toLocaleString('uk-UA');

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
