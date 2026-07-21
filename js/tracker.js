/**
 * tracker.js — Visitor Analytics Tracker
 * Tracks user behavior (pageviews, clicks, scroll depth), UTM tags, geo locations, browser & device types.
 * Sends data to Supabase analytics_events table.
 */

(async function initTracker() {
  try {
    // ── 0. Check Excluded / Admin Device ────────────────────────────────────
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('no_track') === '1' || urlParams.get('admin') === '1' || urlParams.get('ignore_analytics') === '1') {
      localStorage.setItem('ignore_analytics', 'true');
      localStorage.setItem('is_admin_device', 'true');
      console.log('[Tracker] Device marked as ignored for analytics.');
    } else if (urlParams.get('track') === '1' || urlParams.get('enable_analytics') === '1') {
      localStorage.removeItem('ignore_analytics');
      localStorage.removeItem('is_admin_device');
      console.log('[Tracker] Analytics tracking re-enabled for this device.');
    }

    const isIgnoredDevice = 
      localStorage.getItem('ignore_analytics') === 'true' || 
      localStorage.getItem('is_admin_device') === 'true' || 
      sessionStorage.getItem('is_admin_device') === 'true' ||
      window.location.pathname.includes('/admin');

    if (isIgnoredDevice) {
      console.debug('[Tracker] Admin device / path detected. Analytics tracking skipped.');
      return;
    }

    // ── 1. UTM Parameters Setup ─────────────────────────────────────────────
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');

    if (utmSource) sessionStorage.setItem('utm_source', utmSource);
    if (utmMedium) sessionStorage.setItem('utm_medium', utmMedium);
    if (utmCampaign) sessionStorage.setItem('utm_campaign', utmCampaign);

    const currentUtm = {
      utm_source: sessionStorage.getItem('utm_source') || null,
      utm_medium: sessionStorage.getItem('utm_medium') || null,
      utm_campaign: sessionStorage.getItem('utm_campaign') || null
    };

    // ── 2. Storage Helpers (localStorage + cookie fallback) ─────────
    function getCookie(name) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    }

    function setCookie(name, value, days = 365) {
      const d = new Date();
      d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
    }

    function getStored(key) {
      try {
        const val = localStorage.getItem(key);
        if (val) return val;
      } catch(e) {}
      return getCookie(key);
    }

    function setStored(key, value) {
      try { localStorage.setItem(key, value); } catch(e) {}
      setCookie(key, value);
    }

    // ── 3. Identification (Daily Unique & Returning Detection) ──────
    const today = new Date().toISOString().split('T')[0];
    let isDailyUnique = false;
    let isReturning = false;
    
    let firstVisit = getStored('first_visit_date');
    const lastTrackedDay = getStored('last_tracked_day');
    
    if (!firstVisit) {
      setStored('first_visit_date', today);
      firstVisit = today;
    } else if (firstVisit < today) {
      isReturning = true;
    }
    
    // Check if this visitor has been counted for today's daily unique count
    if (lastTrackedDay !== today) {
      setStored('last_tracked_day', today);
      isDailyUnique = true;
    }

    // ── 3. Device / Browser / OS & Referrer Detection ───────────────────────
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

    const deviceType = detectPlatform();
    const browser = detectBrowser();
    const os = detectOS();

    let referrer = sessionStorage.getItem('entry_referrer');
    if (referrer === null) {
      const ref = document.referrer;
      if (ref && !ref.includes(window.location.hostname)) {
        referrer = ref.slice(0, 250);
      } else {
        referrer = 'Direct';
      }
      sessionStorage.setItem('entry_referrer', referrer);
    }

    // ── 4. Geolocation (Lookup once per session) ───────────────────────────
    let city = sessionStorage.getItem('geo_city') || null;
    let country = sessionStorage.getItem('geo_country') || null;

    async function fetchGeoData() {
      if (city || sessionStorage.getItem('geo_checked')) return;
      try {
        const res = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined });
        if (res.ok) {
          const data = await res.json();
          sessionStorage.setItem('geo_checked', '1');
          if (data.cityName && data.cityName !== '-') {
            city = data.cityName;
            sessionStorage.setItem('geo_city', city);
          } else if (data.countryName && data.countryName !== '-') {
            city = data.countryName; // Fallback to country
            sessionStorage.setItem('geo_city', city);
          } else {
            city = 'Unknown';
          }
          if (data.countryName) {
            country = data.countryName;
            sessionStorage.setItem('geo_country', country);
          }
        }
      } catch (e) {
        sessionStorage.setItem('geo_checked', '1');
        city = 'Unknown';
        console.debug('[Tracker] Geo lookup failed:', e.message);
      }
    }

    // ── 5. Supabase REST API Mock Wrapper ────────────────────────────────────
    const supabase = {
      rpc: async (fn, data) => {
        const config = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : (window.SITE_CONFIG || {});
        const { url, anonKey } = config.supabase || {};
        if (!url || !anonKey || url.includes('YOUR_PROJECT_ID')) {
          return;
        }
        const endpoint = `${url}/rest/v1/rpc/${fn}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'apikey': anonKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(errMsg);
        }
      }
    };

    // ── 6. Main trackEvent Function ──────────────────────────────────────────
    async function trackEvent(eventData) {
      try {
        const payload = {
          p_event_type: eventData.eventType,
          p_event_target: eventData.eventTarget || null,
          p_scroll_depth: eventData.scroll_depth !== undefined ? eventData.scroll_depth : null,
          p_time_on_site: eventData.time_on_site !== undefined ? eventData.time_on_site : null,
          p_is_new_visitor: isDailyUnique,
          p_is_returning: isReturning && isDailyUnique,
          p_utm_source: currentUtm.utm_source,
          p_city: city,
          p_os: os,
          p_browser: browser,
          p_device: deviceType,
          p_referrer: referrer
        };

        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        // Reset daily flags after the first event of the day so they aren't double-counted
        isDailyUnique = false;
        isReturning = false;
      } catch (err) {
        console.debug('[Tracker] Error logging event locally:', err.message);
      }
    }

    // Initialize and run
    await fetchGeoData();
    trackEvent({ eventType: 'pageview' });

    // ── 7. Scroll Depth Tracking ─────────────────────────────────────────────
    const getSentScrollDepths = () => {
      try {
        const data = sessionStorage.getItem('sent_scroll_depths');
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    };

    const markScrollDepthSent = (depth) => {
      const depths = getSentScrollDepths();
      if (!depths.includes(depth)) {
        depths.push(depth);
        sessionStorage.setItem('sent_scroll_depths', JSON.stringify(depths));
      }
    };

    const isScrollDepthSent = (depth) => {
      return getSentScrollDepths().includes(depth);
    };

    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        scrollTimeout = null;

        const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const totalScrollable = scrollHeight - clientHeight;
        if (totalScrollable <= 0) return;

        const percentage = Math.round((scrollTop / totalScrollable) * 100);
        const milestones = [25, 50, 75, 100];

        for (const milestone of milestones) {
          if (percentage >= milestone && !isScrollDepthSent(milestone)) {
            markScrollDepthSent(milestone);
            trackEvent({
              eventType: 'scroll',
              scroll_depth: milestone
            });
          }
        }
      }, 100);
    });

    // ── 8. Click Tracking ───────────────────────────────────────────────────
    document.addEventListener('click', (e) => {
      const trackEl = e.target.closest('[data-track="true"], .btn, a[href^="tel:"], a[href^="mailto:"], .social-link, .contact-card');
      if (!trackEl) return;

      // Debounce: prevent duplicate clicks within 500ms
      const now = Date.now();
      const lastClickTime = parseInt(trackEl.dataset.lastClickTime || '0', 10);
      if (now - lastClickTime < 500) return;
      trackEl.dataset.lastClickTime = now.toString();

      let eventName = trackEl.getAttribute('data-event-name');
      if (!eventName) {
        eventName = trackEl.innerText ? trackEl.innerText.trim().substring(0, 30) : 'unnamed-click';
      }

      trackEvent({
        eventType: 'click',
        eventTarget: eventName
      });
    });

    // ── 9. Time on Site Milestones ──────────────────────────────────────────
    const timeMilestones = [
      { time: 10, label: '10s' },
      { time: 30, label: '30s' },
      { time: 60, label: '1m' },
      { time: 120, label: '2m' },
      { time: 300, label: '5m' },
      { time: 600, label: '10m' }
    ];

    timeMilestones.forEach(milestone => {
      setTimeout(() => {
        trackEvent({
          eventType: 'time_on_site',
          eventTarget: milestone.label,
          time_on_site: milestone.time
        });
      }, milestone.time * 1000);
    });

  } catch (err) {
    console.debug('[Tracker] Initialization failed:', err.message);
  }
})();
