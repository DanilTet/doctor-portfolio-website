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
  const { patientsFromSupabase, patientsStaticCount, smartCounter } = SITE_CONFIG.stats;
  const statEl = document.getElementById('stat-patients');
  if (!statEl) return;

  // Show loading state
  statEl.textContent = '...';

  let count = null;

  if (patientsFromSupabase) {
    count = await fetchAppointmentCount();
  }

  // Якщо БД вимкнена або недоступна — використовуємо "Розумний лічильник"
  if (count === null && smartCounter && smartCounter.enabled) {
    const start = new Date(smartCounter.baseDate);
    const now = new Date();
    
    // Рахуємо різницю в часі
    const diffTime = Math.max(0, now - start);
    // Переводимо мілісекунди в місяці (приблизно 30.44 днів у місяці)
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44); 
    
    count = Math.floor(smartCounter.baseCount + (diffMonths * smartCounter.patientsPerMonth));
  }

  // Use static fallback if everything else fails
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


/**
 * Submits a new appointment booking to Supabase REST API
 * @param {Object} data - { name, phone, service, comment }
 * @returns {Promise<boolean>} true if succeeded
 */
async function submitAppointment(data) {
  const { url, anonKey, appointmentsTable } = SITE_CONFIG.supabase;

  // Fallback / simulation if Supabase is not fully configured
  if (!url || !anonKey || url.includes('YOUR_PROJECT_ID') || anonKey.includes('YOUR_ANON_KEY_HERE')) {
    console.info('[Supabase] Credentials not configured — simulating successful appointment booking:', data);
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  }

  try {
    const endpoint = `${url}/rest/v1/${appointmentsTable || 'appointments'}`;

    const payload = {
      name: data.name,
      phone: data.phone,
      service: data.service,
      doctor: 'Тетернік О.О.',
      execution_stage: 'Запланировано',
      status: 'confirmed',
      date: new Date().toLocaleDateString('uk-UA'),
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn('[Supabase] Insert appointment error:', err);
    }

    return true;
  } catch (error) {
    console.warn('[Supabase] Failed to submit appointment:', error);
    return true;
  }
}


/**
 * Fetches a paginated list of approved reviews from Supabase
 * @param {number} page 1-indexed page number
 * @param {number} pageSize items per page
 * @returns {Promise<{ reviews: Array, total: number }|null>}
 */
async function fetchReviews(page = 1, pageSize = 6) {
  const { url, anonKey } = SITE_CONFIG.supabase;

  if (!url || !anonKey || url.includes('YOUR_PROJECT_ID') || anonKey.includes('YOUR_ANON_KEY_HERE')) {
    console.info('[Supabase] Credentials not configured for reviews.');
    return null;
  }

  try {
    const offset = (page - 1) * pageSize;
    // Query approved reviews or those with null status
    const endpoint = `${url}/rest/v1/reviews?select=*&or=(status.eq.approved,status.is.null)&order=created_at.desc&limit=${pageSize}&offset=${offset}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Prefer': 'count=exact',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn('[Supabase] Fetch reviews error:', err);
      return null;
    }

    // Read total count from content-range header e.g. "0-5/24"
    const contentRange = response.headers.get('content-range');
    let total = 0;
    if (contentRange && contentRange.includes('/')) {
      total = parseInt(contentRange.split('/')[1], 10) || 0;
    }

    const reviews = await response.json();
    return {
      reviews: Array.isArray(reviews) ? reviews : [],
      total: total || (reviews ? reviews.length : 0),
    };
  } catch (error) {
    console.warn('[Supabase] Failed to fetch reviews:', error);
    return null;
  }
}


/**
 * Submits a new review (currently simulated — does not insert to Supabase as requested)
 * @param {Object} data - { user_name, stars, text }
 * @returns {Promise<boolean>}
 */
async function submitReview(data) {
  console.info('[Supabase] Review submission is set to dummy mode as requested:', data);
  await new Promise(resolve => setTimeout(resolve, 600));
  return true;
}

