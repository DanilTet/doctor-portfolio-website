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
  const { url, anonKey } = SITE_CONFIG.supabase;

  if (!url || !anonKey || url.includes('YOUR_PROJECT_ID') || anonKey.includes('YOUR_ANON_KEY_HERE')) {
    console.info('[Supabase] Credentials not configured — using static fallback.');
    return null;
  }

  try {
    // Call the secure RPC function (bypasses RLS, returns only the count number)
    const endpoint = `${url}/rest/v1/rpc/get_appointments_count`;

    console.info(`[Supabase] Calling RPC: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    console.info(`[Supabase] Response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[Supabase] Error body:', errorBody);
      throw new Error(`Supabase RPC error: ${response.status} — ${errorBody}`);
    }

    const count = await response.json();
    console.info(`[Supabase] ✅ Patient count: ${count}`);
    return typeof count === 'number' ? count : null;

  } catch (error) {
    console.warn('[Supabase] Failed to fetch patient count:', error.message);
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
