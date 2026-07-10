/**
 * admin.js — Admin Panel Logic
 * Supabase Auth + Analytics + Schedule + Appointments + Reviews
 * Security: all user data rendered via textContent (no innerHTML for user content)
 */

/* ============================================================
   CONFIG — reads from parent env.js injected in HTML
   ============================================================ */
const CFG = (() => {
  const env = window.ADMIN_ENV || {};
  return {
    url:       env.SUPABASE_URL       || '',
    anonKey:   env.SUPABASE_ANON_KEY  || '',
    botUrl:    env.BOT_URL            || '',
    botSecret: env.BOT_SECRET         || '',
  };
})();

/* ============================================================
   SUPABASE CLIENT — thin REST wrapper
   ============================================================ */
const Supabase = {
  _token: null,
  _user:  null,

  headers(extra = {}) {
    const h = {
      'apikey':       CFG.anonKey,
      'Content-Type': 'application/json',
      ...extra,
    };
    if (this._token) h['Authorization'] = `Bearer ${this._token}`;
    return h;
  },

  // ── Auth ─────────────────────────────────────────────────
  async login(email, password) {
    const res = await fetch(`${CFG.url}/auth/v1/token?grant_type=password`, {
      method:  'POST',
      headers: { 'apikey': CFG.anonKey, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || 'Ошибка входа');
    this._token = data.access_token;
    this._user  = data.user;
    sessionStorage.setItem('admin_token', data.access_token);
    sessionStorage.setItem('admin_email', data.user?.email || email);
    return data;
  },

  async logout() {
    try {
      await fetch(`${CFG.url}/auth/v1/logout`, {
        method:  'POST',
        headers: this.headers(),
      });
    } finally {
      this._token = null;
      this._user  = null;
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_email');
    }
  },

  restoreSession() {
    const token = sessionStorage.getItem('admin_token');
    if (token) {
      this._token = token;
      return true;
    }
    return false;
  },

  // ── REST helpers ─────────────────────────────────────────
  async get(table, params = '') {
    const res = await fetch(`${CFG.url}/rest/v1/${table}${params}`, {
      headers: this.headers({ 'Prefer': 'count=exact' }),
    });
    if (res.status === 401) {
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_email');
      location.reload();
      return { data: [], total: 0 };
    }
    if (!res.ok) throw new Error(await res.text());
    const total = (() => {
      const cr = res.headers.get('content-range');
      return cr && cr.includes('/') ? parseInt(cr.split('/')[1], 10) : null;
    })();
    return { data: await res.json(), total };
  },

  async rpc(fn, body = {}) {
    const res = await fetch(`${CFG.url}/rest/v1/rpc/${fn}`, {
      method:  'POST',
      headers: this.headers(),
      body:    JSON.stringify(body),
    });
    if (res.status === 401) {
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_email');
      location.reload();
      return;
    }
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async patch(table, id, payload) {
    const res = await fetch(`${CFG.url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
      method:  'PATCH',
      headers: this.headers({ 'Prefer': 'return=minimal' }),
      body:    JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  },

  async upsert(table, payload) {
    const res = await fetch(`${CFG.url}/rest/v1/${table}`, {
      method:  'POST',
      headers: this.headers({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
      body:    JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  },

  async delete(table, id) {
    const res = await fetch(`${CFG.url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
      method:  'DELETE',
      headers: this.headers({ 'Prefer': 'return=minimal' }),
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  },
};

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  };

  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = icons[type] || '';

  const span = document.createElement('span');
  span.textContent = msg;
  el.appendChild(span);

  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ============================================================
   NAVIGATION
   ============================================================ */
let currentPage = 'dashboard';

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  document.querySelectorAll('.page-section').forEach(el => {
    el.classList.toggle('active', el.id === `page-${page}`);
  });

  const titles = {
    dashboard:    'Дашборд',
    marketing:    'Маркетинг',
    'premium-dashboard': 'Розклад Прийомів (Premium)',
    'site-leads': 'Заявки з сайту (Ліди)',
    appointments: 'Заявки на прием',
    reviews:      'Модерация отзывов',
    'patient-history': 'Історія пацієнта',
  };
  const titleEl = document.getElementById('top-bar-title');
  if (titleEl) titleEl.textContent = titles[page] || page;

  // Load data for the active section
  if (page === 'dashboard')    loadAnalytics();
  if (page === 'marketing')    loadMarketingAnalytics();
  if (page === 'appointments') loadAppointments();
  if (page === 'site-leads')   loadSiteLeads();
  if (page === 'reviews')      loadReviews();
  if (page === 'premium-dashboard') initPremiumDashboard();
  if (page === 'patient-history') initPatientHistory();
}

/* ============================================================
   DASHBOARD — ANALYTICS
   ============================================================ */
let attendanceChart = null;
let servicesChart = null;
let cachedActiveAppts = [];

// Parse "DD.MM.YYYY" or "YYYY-MM-DD" to Date object
function parseApptDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr.includes('.')) {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
    }
  }
  if (dateStr.includes('-')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function normalizeService(srv) {
  if (!srv) return 'Інше';
  let s = srv.toLowerCase().trim();
  if (s.includes('гастро') && s.includes('колоно')) return 'Гастро + Колоно';
  if (s.includes('гастро')) return 'Гастроскопія';
  if (s.includes('колоно')) return 'Колоноскопія';
  if (s.includes('ректо')) return 'Ректороманоскопія';
  if (s.includes('бронхо')) return 'Бронхоскопія';
  if (s.includes('ерхпг') || s.includes('эрхпг')) return 'ЕРХПГ';
  if (s.includes('узд') || s.includes('узи')) return 'УЗД';
  if (s.includes('консультац') || s.includes('запланировано')) return 'Консультація';
  return 'Інше';
}

async function loadAnalytics() {
  try {
    let allAppts = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;
    
    // Fetch all records using pagination to guarantee we don't miss anything or get random subsets
    while (hasMore) {
      const { data } = await Supabase.get('appointments', `?select=*&order=id.desc&limit=${limit}&offset=${offset}`);
      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        allAppts = allAppts.concat(data);
        if (data.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      }
    }
    
    // Filter active appointments and pre-parse valid dates
    cachedActiveAppts = allAppts
      .filter(a => a.status !== 'cancelled')
      .map(a => ({ ...a, parsedDate: parseApptDate(a.date) }))
      .filter(a => a.parsedDate !== null);

    // Calculate weekly stats
    updateWeeklyMetrics(cachedActiveAppts);

    // Render Doughnut Chart
    renderServicesChart(cachedActiveAppts);

    // Initial render of Attendance Chart and set up listener
    const rangeSelect = document.getElementById('analytics-time-range');
    if (rangeSelect) {
      rangeSelect.removeEventListener('change', handleTimeRangeChange);
      rangeSelect.addEventListener('change', handleTimeRangeChange);
      updateAttendanceChart(rangeSelect.value);
    } else {
      updateAttendanceChart('all_time');
    }

  } catch (err) {
    console.error(err);
    toast('Помилка завантаження аналітики', 'error');
  }
}

let marketingSourcesChart = null;

function handleMarketingRangeChange(e) {
  loadMarketingAnalytics(parseInt(e.target.value, 10));
}

async function loadMarketingAnalytics(rangeDays) {
  try {
    const rangeSelect = document.getElementById('marketing-time-range');
    if (rangeSelect) {
      rangeSelect.removeEventListener('change', handleMarketingRangeChange);
      rangeSelect.addEventListener('change', handleMarketingRangeChange);
    }

    const daysCount = rangeDays || (rangeSelect ? parseInt(rangeSelect.value, 10) : 30);
    const fetchLimit = daysCount * 2;

    const { data } = await Supabase.get('daily_analytics', `?limit=${fetchLimit}&order=date.desc`);
    const days = data || [];

    // Split into current and previous periods
    const currentPeriodDays = days.slice(0, daysCount);
    const previousPeriodDays = days.slice(daysCount, daysCount * 2);

    const aggregatePeriodData = (daysList) => {
      let totalVisits = 0;
      let uniqueVisitors = 0;
      let returningVisitors = 0;
      let totalScrollDepth = 0;
      let scrollEvents = 0;
      let totalTimeOnSite = 0;
      let timeEvents = 0;

      const sourceCounts = {};
      const clickCounts = {};
      const cityCounts = {};
      const deviceCounts = {};
      const osCounts = {};
      const browserCounts = {};
      const referrerCounts = {};

      const mergeJson = (target, source) => {
        if (!source) return;
        Object.entries(source).forEach(([k, v]) => {
          target[k] = (target[k] || 0) + (parseInt(v, 10) || 0);
        });
      };

      daysList.forEach(day => {
        totalVisits += day.pageviews || 0;
        uniqueVisitors += day.unique_visitors || 0;
        returningVisitors += day.returning_visitors || 0;
        
        totalScrollDepth += day.total_scroll_depth || 0;
        scrollEvents += day.scroll_events || 0;
        
        totalTimeOnSite += day.total_time_on_site || 0;
        timeEvents += day.time_events || 0;

        mergeJson(sourceCounts, day.utm_sources);
        mergeJson(clickCounts, day.clicks);
        mergeJson(cityCounts, day.cities);
        mergeJson(deviceCounts, day.devices);
        mergeJson(osCounts, day.os);
        mergeJson(browserCounts, day.browsers);
        mergeJson(referrerCounts, day.referrers);
      });

      const avgScroll = scrollEvents > 0 ? Math.round(totalScrollDepth / scrollEvents) : 0;
      const avgSeconds = timeEvents > 0 ? Math.round(totalTimeOnSite / timeEvents) : 0;
      const returningRate = uniqueVisitors > 0 ? Math.round((returningVisitors / uniqueVisitors) * 100) : 0;

      return {
        totalVisits,
        uniqueVisitors,
        returningVisitors,
        returningRate,
        avgScroll,
        avgSeconds,
        sourceCounts,
        clickCounts,
        cityCounts,
        deviceCounts,
        osCounts,
        browserCounts,
        referrerCounts
      };
    };

    const current = aggregatePeriodData(currentPeriodDays);
    const previous = aggregatePeriodData(previousPeriodDays);

    // Helper for formatting time
    const formatTime = (avgSeconds) => {
      let timeDisplay = '0с';
      if (avgSeconds < 60) {
        timeDisplay = `${avgSeconds}с`;
      } else {
        const mins = Math.floor(avgSeconds / 60);
        const secs = avgSeconds % 60;
        timeDisplay = secs > 0 ? `${mins}хв ${secs}с` : `${mins}хв`;
      }
      return timeDisplay;
    };

    // Render primary stats
    document.getElementById('m-stat-visitors').textContent = current.uniqueVisitors.toLocaleString();
    document.getElementById('m-stat-sessions').textContent = current.totalVisits.toLocaleString();
    document.getElementById('m-stat-returning').textContent = `${current.returningRate}%`;
    document.getElementById('m-stat-scroll').textContent = `${current.avgScroll}%`;
    document.getElementById('m-stat-time').textContent = formatTime(current.avgSeconds);

    // Format trends
    const formatTrend = (curVal, prevVal, isPercent = false, suffix = '') => {
      const elTrend = document.createElement('span');
      if (prevVal === 0) {
        elTrend.className = curVal > 0 ? 'trend-up' : 'trend-neutral';
        elTrend.textContent = curVal > 0 ? '⬆ +100%' : 'Без змін';
        return elTrend.outerHTML;
      }
      const diff = curVal - prevVal;
      const pct = Math.round((diff / prevVal) * 100);
      if (diff > 0) {
        elTrend.className = 'trend-up';
        elTrend.textContent = `⬆ +${isPercent ? pct : diff.toLocaleString()}${suffix}`;
      } else if (diff < 0) {
        elTrend.className = 'trend-down';
        elTrend.textContent = `⬇ ${isPercent ? pct : Math.abs(diff).toLocaleString()}${suffix}`;
      } else {
        elTrend.className = 'trend-neutral';
        elTrend.textContent = 'Без змін';
      }
      return elTrend.outerHTML;
    };

    document.getElementById('m-trend-visitors').innerHTML = formatTrend(current.uniqueVisitors, previous.uniqueVisitors, true) + ' <span style="color:var(--text-muted)">пор. з мин. пер.</span>';
    document.getElementById('m-trend-sessions').innerHTML = formatTrend(current.totalVisits, previous.totalVisits, true) + ' <span style="color:var(--text-muted)">пор. з мин. пер.</span>';
    document.getElementById('m-trend-returning').innerHTML = formatTrend(current.returningRate, previous.returningRate, false, '%') + ' <span style="color:var(--text-muted)">пор. з мин. пер.</span>';
    document.getElementById('m-trend-scroll').innerHTML = formatTrend(current.avgScroll, previous.avgScroll, false, '%') + ' <span style="color:var(--text-muted)">пор. з мин. пер.</span>';
    document.getElementById('m-trend-time').innerHTML = formatTrend(current.avgSeconds, previous.avgSeconds, true) + ' <span style="color:var(--text-muted)">пор. з мин. пер.</span>';

    // 2. Traffic Sources Chart
    const labels = Object.keys(current.sourceCounts);
    const chartValues = Object.values(current.sourceCounts);

    const premiumColors = [
      '#6366f1', '#a855f7', '#38bdf8', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6'
    ];

    let finalColors = premiumColors.slice(0, labels.length);

    if (labels.length === 0) {
      labels.push('Немає даних');
      chartValues.push(1);
      finalColors = ['rgba(255, 255, 255, 0.05)'];
    }

    if (marketingSourcesChart) {
      marketingSourcesChart.destroy();
    }

    const canvas = document.getElementById('chart-marketing-sources');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      marketingSourcesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: chartValues,
            backgroundColor: finalColors,
            borderColor: '#13161e',
            borderWidth: 2,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'right',
              labels: { color: '#f1f3f9', font: { family: "'Inter', sans-serif", size: 12 }, padding: 15 }
            },
            tooltip: {
              backgroundColor: '#1a1e2a', titleColor: '#f1f3f9', bodyColor: '#8b93a8', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1
            }
          }
        }
      });
    }

    // Render detailed list of sources with comparisons
    const sourcesListContainer = document.getElementById('marketing-sources-list');
    if (sourcesListContainer) {
      const sortedSources = Object.entries(current.sourceCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      if (sortedSources.length === 0) {
        sourcesListContainer.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:32px">Немає даних про джерела...</div>`;
      } else {
        const totalVisitsCount = current.totalVisits || 1;
        sourcesListContainer.innerHTML = sortedSources.map(item => {
          const prevCount = previous.sourceCounts[item.name] || 0;
          const diff = item.count - prevCount;
          const pct = Math.round((item.count / totalVisitsCount) * 100);
          
          let diffBadge = '';
          if (diff > 0) diffBadge = `<span class="trend-up" style="font-size:11px; margin-left: 6px;">(+${diff})</span>`;
          else if (diff < 0) diffBadge = `<span class="trend-down" style="font-size:11px; margin-left: 6px;">(${diff})</span>`;

          const tempNode = document.createElement('div');
          tempNode.textContent = item.name;
          return `
            <div class="action-item">
              <span class="action-name">📥 ${tempNode.innerHTML}</span>
              <span class="action-count-badge">${item.count} відв. (${pct}%)${diffBadge}</span>
            </div>
          `;
        }).join('');
      }
    }

    // 3. Render click actions with comparisons
    const clicksListContainer = document.getElementById('marketing-clicks-list');
    if (clicksListContainer) {
      const sortedClicks = Object.entries(current.clickCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Show top 10

      if (sortedClicks.length === 0) {
        clicksListContainer.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:32px">Немає даних про кліки...</div>`;
      } else {
        clicksListContainer.innerHTML = sortedClicks.map(item => {
          const prevCount = previous.clickCounts[item.name] || 0;
          const diff = item.count - prevCount;
          
          let diffBadge = '';
          if (diff > 0) diffBadge = `<span class="trend-up" style="font-size:11px; margin-left: 6px;">(+${diff})</span>`;
          else if (diff < 0) diffBadge = `<span class="trend-down" style="font-size:11px; margin-left: 6px;">(${diff})</span>`;

          const tempNode = document.createElement('div');
          tempNode.textContent = item.name;
          return `
            <div class="action-item">
              <span class="action-name">🎯 ${tempNode.innerHTML}</span>
              <span class="action-count-badge">${item.count} кліків ${diffBadge}</span>
            </div>
          `;
        }).join('');
      }
    }

    // 4. Render Top Cities with comparisons
    const citiesListContainer = document.getElementById('marketing-cities-list');
    if (citiesListContainer) {
      const sortedCities = Object.entries(current.cityCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      if (sortedCities.length === 0) {
        citiesListContainer.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:32px">Немає даних про міста...</div>`;
      } else {
        const totalGeoSessions = Object.values(current.cityCounts).reduce((sum, v) => sum + v, 0) || 1;
        citiesListContainer.innerHTML = sortedCities.map(item => {
          const prevCount = previous.cityCounts[item.name] || 0;
          const diff = item.count - prevCount;
          const pct = Math.round((item.count / totalGeoSessions) * 100);
          
          let diffBadge = '';
          if (diff > 0) diffBadge = `<span class="trend-up" style="font-size:11px; margin-left: 6px;">(+${diff})</span>`;
          else if (diff < 0) diffBadge = `<span class="trend-down" style="font-size:11px; margin-left: 6px;">(${diff})</span>`;

          const tempNode = document.createElement('div');
          tempNode.textContent = item.name;
          return `
            <div class="action-item">
              <span class="action-name">📍 ${tempNode.innerHTML}</span>
              <span class="action-count-badge">${item.count} відв. (${pct}%)${diffBadge}</span>
            </div>
          `;
        }).join('');
      }
    }

    // 5. Render Tech Breakdown (devices, OS, browsers, referrers) with comparisons
    const techListContainer = document.getElementById('marketing-tech-list');
    if (techListContainer) {
      const totalTechSessions = Object.values(current.deviceCounts).reduce((sum, v) => sum + v, 0) || 1;
      const totalRefs = Object.values(current.referrerCounts).reduce((sum, v) => sum + v, 0) || 1;

      const topDevice = Object.entries(current.deviceCounts).map(([name, count]) => ({ name, count, pct: Math.round((count / totalTechSessions) * 100) })).sort((a, b) => b.count - a.count)[0];
      const topOS = Object.entries(current.osCounts).map(([name, count]) => ({ name, count, pct: Math.round((count / totalTechSessions) * 100) })).sort((a, b) => b.count - a.count)[0];
      const topBrowser = Object.entries(current.browserCounts).map(([name, count]) => ({ name, count, pct: Math.round((count / totalTechSessions) * 100) })).sort((a, b) => b.count - a.count)[0];
      const topReferrer = Object.entries(current.referrerCounts).map(([name, count]) => ({ name, count, pct: Math.round((count / totalRefs) * 100) })).sort((a, b) => b.count - a.count)[0];

      let html = '';
      if (!topDevice && !topOS && !topBrowser && !topReferrer) {
        techListContainer.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:32px">Немає даних про пристрої...</div>`;
      } else {
        const renderTechItem = (icon, label, item, prevCounts) => {
          if (!item) return '';
          const prevCount = prevCounts[item.name] || 0;
          const diff = item.count - prevCount;
          
          let diffBadge = '';
          if (diff > 0) diffBadge = `<span class="trend-up" style="font-size:11px; margin-left: 6px;">(+${diff})</span>`;
          else if (diff < 0) diffBadge = `<span class="trend-down" style="font-size:11px; margin-left: 6px;">(${diff})</span>`;

          let displayName = item.name;
          if (displayName.startsWith('http')) {
            try { displayName = new URL(displayName).hostname; } catch(e) {}
          }

          const tempNode = document.createElement('div');
          tempNode.textContent = displayName;

          return `
            <div class="action-item">
              <span class="action-name">${icon} ${label}: <strong>${tempNode.innerHTML}</strong></span>
              <span class="action-count-badge">${item.pct}%${diffBadge}</span>
            </div>
          `;
        };

        html += renderTechItem('📱', 'Пристрій', topDevice, previous.deviceCounts);
        html += renderTechItem('💻', 'ОС', topOS, previous.osCounts);
        html += renderTechItem('🌐', 'Браузер', topBrowser, previous.browserCounts);
        html += renderTechItem('🔗', 'Реферер', topReferrer, previous.referrerCounts);
        techListContainer.innerHTML = html;
      }
    }

  } catch (err) {
    console.error('loadMarketingAnalytics error:', err);
    toast('Помилка завантаження маркетингової аналітики', 'error');
  }
}

function handleTimeRangeChange(e) {
  updateAttendanceChart(e.target.value);
}

function updateWeeklyMetrics(appts) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // Current range: last 7 days (now-6 to now)
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - 6);

  // Previous range: now-13 to now-7
  const previousWeekStart = new Date(now);
  previousWeekStart.setDate(now.getDate() - 13);
  
  const previousWeekEnd = new Date(now);
  previousWeekEnd.setDate(now.getDate() - 7);
  previousWeekEnd.setHours(23, 59, 59, 999);

  const fmtDate = (d) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
  };

  const curRangeStr = `${fmtDate(currentWeekStart)} - ${fmtDate(now)}`;
  const prevRangeStr = `${fmtDate(previousWeekStart)} - ${fmtDate(previousWeekEnd)}`;

  let curTotal = 0, prevTotal = 0;
  let curTeternik = 0, prevTeternik = 0;
  let curDanilo = 0, prevDanilo = 0;
  let curKalashnikov = 0, prevKalashnikov = 0;

  appts.forEach(appt => {
    const ts = appt.parsedDate.getTime();
    const isCur = ts >= currentWeekStart.getTime() && ts <= todayEnd.getTime();
    const isPrev = ts >= previousWeekStart.getTime() && ts <= previousWeekEnd.getTime();

    if (isCur || isPrev) {
      const doctorStr = (appt.doctor || '').toLowerCase();
      const isDanilo = doctorStr.includes('данило') || doctorStr.includes('даніло') || doctorStr.includes('данил');
      const isKalashnikov = doctorStr.includes('калашников') || doctorStr.includes('калашніков');
      const isTeternik = doctorStr.includes('тетерник') || doctorStr.includes('тетернік');

      if (isCur) {
        curTotal++;
        if (isDanilo) curDanilo++;
        else if (isKalashnikov) curKalashnikov++;
        else if (isTeternik) curTeternik++;
      } else {
        prevTotal++;
        if (isDanilo) prevDanilo++;
        else if (isKalashnikov) prevKalashnikov++;
        else if (isTeternik) prevTeternik++;
      }
    }
  });

  updateMetricCard('total-appts', curTotal, prevTotal, curRangeStr, prevRangeStr);
  updateMetricCard('teternik', curTeternik, prevTeternik, curRangeStr, prevRangeStr);
  updateMetricCard('danilo', curDanilo, prevDanilo, curRangeStr, prevRangeStr);
  updateMetricCard('kalashnikov', curKalashnikov, prevKalashnikov, curRangeStr, prevRangeStr);
}

function updateMetricCard(idSuffix, curVal, prevVal, curRangeStr, prevRangeStr) {
  const elVal = document.getElementById(`stat-${idSuffix}`);
  const elTrend = document.getElementById(`trend-${idSuffix}`);
  if (elVal) elVal.textContent = curVal;

  if (elVal) {
    const card = elVal.closest('.stat-card');
    const labelEl = card ? card.querySelector('.stat-label') : null;
    if (labelEl) {
      if (idSuffix === 'total-appts') {
        labelEl.textContent = `Всього прийомів (${curRangeStr})`;
      } else if (idSuffix === 'teternik') {
        labelEl.textContent = `Прийоми: Тетернік (${curRangeStr})`;
      } else if (idSuffix === 'danilo') {
        labelEl.textContent = `Прийоми: Данило (${curRangeStr})`;
      } else if (idSuffix === 'kalashnikov') {
        labelEl.textContent = `Прийоми: Калашніков (${curRangeStr})`;
      }
    }
  }
  
  if (elTrend) {
    if (prevVal === 0) {
      elTrend.textContent = curVal > 0 ? `⬆ +100% порівняно з ${prevRangeStr}` : 'Немає змін';
      elTrend.className = curVal > 0 ? 'stat-trend trend-up' : 'stat-trend trend-neutral';
    } else {
      const diff = curVal - prevVal;
      const pct = Math.round((diff / prevVal) * 100);
      if (diff > 0) {
        elTrend.textContent = `⬆ +${pct}% порівняно з ${prevRangeStr}`;
        elTrend.className = 'stat-trend trend-up';
      } else if (diff < 0) {
        elTrend.textContent = `⬇ ${Math.abs(pct)}% порівняно з ${prevRangeStr}`;
        elTrend.className = 'stat-trend trend-down';
      } else {
        elTrend.textContent = `Без змін порівняно з ${prevRangeStr}`;
        elTrend.className = 'stat-trend trend-neutral';
      }
    }
  }
}

function renderServicesChart(appts) {
  const servicesMap = {};
  appts.forEach(appt => {
    const srv = normalizeService(appt.service);
    servicesMap[srv] = (servicesMap[srv] || 0) + 1;
  });

  const canvas = document.getElementById('chart-services');
  if (!canvas || !window.Chart) return;
  const ctx = canvas.getContext('2d');

  // Sort by count descending
  const sortedEntries = Object.entries(servicesMap).sort((a, b) => b[1] - a[1]);
  const labels = sortedEntries.map(e => e[0]);
  const data = sortedEntries.map(e => e[1]);
  const totalVal = data.reduce((a, b) => a + b, 0);

  // Gradient base colors (Indigo, Blue, Amber, Green, Purple, Pink, Teal, Red)
  const baseColors = [
    { start: '#818cf8', end: '#4f46e5' },
    { start: '#7dd3fc', end: '#0ea5e9' },
    { start: '#fbbf24', end: '#d97706' },
    { start: '#4ade80', end: '#16a34a' },
    { start: '#c084fc', end: '#9333ea' },
    { start: '#f472b6', end: '#db2777' },
    { start: '#2dd4bf', end: '#0d9488' },
    { start: '#f87171', end: '#dc2626' },
  ];

  const bgColors = data.map((_, i) => {
    const color = baseColors[i % baseColors.length];
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, color.start);
    gradient.addColorStop(1, color.end);
    return gradient;
  });

  if (servicesChart) servicesChart.destroy();

  // Pseudo-3D Drop Shadow Plugin
  const shadowPlugin = {
    id: 'shadowPlugin',
    beforeDraw: (chart) => {
      const { ctx } = chart;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 8;
    },
    afterDraw: (chart) => {
      chart.ctx.restore();
    }
  };

  servicesChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: bgColors,
        borderColor: '#1a1e2a',
        borderWidth: 5,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '55%',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) label += ': ';
              const val = context.parsed;
              const pct = Math.round((val / totalVal) * 100);
              label += `${val} (${pct}%)`;
              return label;
            }
          }
        }
      },
    },
    plugins: [shadowPlugin]
  });

  // Render Custom Legend
  const legendContainer = document.getElementById('chart-services-legend');
  if (legendContainer) {
    legendContainer.innerHTML = '';
    labels.forEach((label, i) => {
      const color = baseColors[i % baseColors.length].end;
      const val = data[i];
      const pct = Math.round((val / totalVal) * 100);
      
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'space-between';
      item.style.fontSize = '14px';

      const left = document.createElement('div');
      left.style.display = 'flex';
      left.style.alignItems = 'center';
      left.style.gap = '8px';

      const dot = document.createElement('div');
      dot.style.width = '12px';
      dot.style.height = '12px';
      dot.style.borderRadius = '50%';
      dot.style.background = color;
      dot.style.boxShadow = `0 0 8px ${color}80`;

      const lbl = document.createElement('span');
      lbl.style.color = 'var(--text-secondary)';
      lbl.textContent = label;

      left.appendChild(dot);
      left.appendChild(lbl);

      const right = document.createElement('div');
      right.style.fontWeight = '600';
      right.style.color = 'var(--text)';
      right.textContent = `${val} `;

      const pctSpan = document.createElement('span');
      pctSpan.style.color = 'var(--text-muted)';
      pctSpan.style.fontWeight = '400';
      pctSpan.style.fontSize = '12px';
      pctSpan.textContent = `(${pct}%)`;
      right.appendChild(pctSpan);

      item.appendChild(left);
      item.appendChild(right);
      legendContainer.appendChild(item);
    });
  }
}

function updateAttendanceChart(range) {
  const attendanceMap = {}; 
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  let startTime = 0;
  let isDaily = false;

  if (range === 'last_30_days') {
    startTime = new Date(now).setDate(now.getDate() - 30);
    isDaily = true;
  } else if (range === 'last_7_days') {
    startTime = new Date(now).setDate(now.getDate() - 7);
    isDaily = true;
  }

  // Pre-fill map to ensure all dates/months are present even if 0
  if (isDaily) {
    let d = new Date(startTime);
    while (d <= now) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      attendanceMap[key] = { total: 0, teternik: 0, danilo: 0, kalashnikov: 0 };
      d.setDate(d.getDate() + 1);
    }
  }

  cachedActiveAppts.forEach(appt => {
    const d = appt.parsedDate;
    const ts = d.getTime();

    // Limit daily ranges to [startTime, todayEnd]
    if (startTime > 0 && (ts < startTime || ts > todayEnd.getTime())) return;

    let key;
    if (isDaily) {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!attendanceMap[key]) {
      attendanceMap[key] = { total: 0, teternik: 0, danilo: 0, kalashnikov: 0 };
    }

    const doctorStr = (appt.doctor || '').toLowerCase();
    
    // Check Danilo first to ensure no overlap
    const isDanilo = doctorStr.includes('данило') || doctorStr.includes('даніло') || doctorStr.includes('данил');
    const isKalashnikov = doctorStr.includes('калашников') || doctorStr.includes('калашніков');
    // If empty or 'не вказано', default to Teternik
    const isTeternik = doctorStr.includes('тетерник') || doctorStr.includes('тетернік') || doctorStr === '' || doctorStr === 'не вказано';

    attendanceMap[key].total++;
    
    if (isDanilo) {
      attendanceMap[key].danilo++;
    } else if (isKalashnikov) {
      attendanceMap[key].kalashnikov++;
    } else if (isTeternik) {
      attendanceMap[key].teternik++;
    } else {
      console.warn('Unknown doctor for appointment:', appt);
    }
  });

  console.log("Analytics Data Loaded:", attendanceMap);
  renderAttendanceChart(attendanceMap, isDaily);
}

function renderAttendanceChart(attendanceMap, isDaily) {
  const ctx = document.getElementById('chart-attendance');
  if (!ctx || !window.Chart) return;

  // Sort keys chronologically
  const keys = Object.keys(attendanceMap).sort();
  
  // Format labels nicely
  const labels = keys.map(k => {
    if (isDaily) {
      const [yr, mo, da] = k.split('-');
      const d = new Date(yr, parseInt(mo)-1, da);
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    } else {
      const [yr, mo] = k.split('-');
      const d = new Date(yr, parseInt(mo)-1, 1);
      return d.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
    }
  });

  const totals = keys.map(k => attendanceMap[k].total);
  const teterniks = keys.map(k => attendanceMap[k].teternik);
  const danilos = keys.map(k => attendanceMap[k].danilo);
  const kalashnikovs = keys.map(k => attendanceMap[k].kalashnikov);

  if (attendanceChart) attendanceChart.destroy();
  attendanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Всього',
          data: totals,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366f1',
        },
        {
          label: 'Тетернік',
          data: teterniks,
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56,189,248,0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#38bdf8',
        },
        {
          label: 'Данило',
          data: danilos,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#f59e0b',
        },
        {
          label: 'Калашніков',
          data: kalashnikovs,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#22c55e',
        }
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: { 
        legend: { 
          position: 'top',
          labels: { color: '#8b93a8', font: { size: 12 } }
        } 
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8b93a8' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8b93a8', precision: 0 }, beginAtZero: true },
      },
    },
  });
}

/* ============================================================
   APPOINTMENTS
   ============================================================ */
let apptFilter = 'pending';
let apptSearch = '';
let apptPage   = 1;
const PAGE_SIZE = 15;

async function loadAppointments() {
  const tbody = document.getElementById('appt-tbody');
  if (!tbody) return;
  tbody.innerHTML = skeletonRows(5, 6);

  try {
    let params = `?select=*&order=id.desc&limit=${PAGE_SIZE}&offset=${(apptPage-1)*PAGE_SIZE}`;

    if (apptFilter !== 'all') {
      params += `&status=eq.${encodeURIComponent(apptFilter)}`;
    }
    if (apptSearch) {
      const q = encodeURIComponent(apptSearch);
      params += `&or=(name.ilike.*${q}*,phone.ilike.*${q}*)`;
    }

    const { data, total } = await Supabase.get('appointments', params);
    renderAppointmentsTable(data || []);
    renderPagination('appt-pagination', total || 0, apptPage, PAGE_SIZE, (p) => {
      apptPage = p;
      loadAppointments();
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--danger);padding:24px">${escText(err.message)}</td></tr>`;
  }
}

async function loadSiteLeads() {
  const tbody = document.getElementById('site-leads-tbody');
  if (!tbody) return;
  tbody.innerHTML = skeletonRows(5, 7);

  try {
    const { data } = await Supabase.get('site_leads', '?order=created_at.desc');
    renderSiteLeadsTable(data || []);
    
    // Update badge
    const badge = document.getElementById('site-leads-badge');
    if (badge) {
      const pendingCount = (data || []).filter(r => r.status === 'pending').length;
      badge.textContent = pendingCount > 0 ? pendingCount : '';
      badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--danger);padding:24px">${escText(err.message)}</td></tr>`;
  }
}

function renderSiteLeadsTable(rows) {
  const tbody = document.getElementById('site-leads-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!rows.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px">Немає заявок</td>`;
    tbody.appendChild(tr);
    return;
  }

  const statusOptions = [
    ['pending', 'Очікує'],
    ['processed', 'Обробленo']
  ];

  rows.forEach(row => {
    const tr = document.createElement('tr');
    tr.dataset.id = row.id;

    // Date format
    const dt = row.created_at ? new Date(row.created_at).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
    
    const renderCell = (content, isHTML = false) => {
      const td = document.createElement('td');
      if (isHTML) td.innerHTML = content;
      else td.textContent = content;
      tr.appendChild(td);
    };

    renderCell(dt);
    renderCell(row.name || '—');
    
    if (row.phone && row.phone !== 'Ручний запис') {
      renderCell(`${escText(row.phone)} <button onclick="window.openPatientHistory('${escText(row.phone)}')" style="background:none; border:1px solid var(--border-color); padding:2px 6px; border-radius:4px; font-size:11px; margin-left:8px; cursor:pointer; color:var(--text-color);">📜 Історія</button>`, true);
    } else {
      renderCell(row.phone || '—');
    }
    
    renderCell(row.service || '—');
    renderCell(row.comment || '—');

    // Badge td
    const status = row.status || 'pending';
    const badgeTd = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'badge ' + (status === 'pending' ? 'badge--pending' : 'badge--completed');
    badge.textContent = status === 'pending' ? 'Очікує' : 'Обробленo';
    badgeTd.appendChild(badge);
    tr.appendChild(badgeTd);

    // Actions td
    const actionTd = document.createElement('td');
    actionTd.style.cssText = 'display:flex;gap:8px;align-items:center';

    const sel = document.createElement('select');
    sel.className = 'form-select';
    sel.style.cssText = 'padding:5px 28px 5px 8px;font-size:12px;width:auto;min-width:100px';
    statusOptions.forEach(([val, label]) => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = label;
      if (val === status) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', async () => {
      sel.disabled = true;
      try {
        await Supabase.patch('site_leads', row.id, { status: sel.value });
        toast('Статус оновлено');
        loadSiteLeads();
      } catch (e) {
        toast(e.message, 'error');
        sel.disabled = false;
      }
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn--danger btn--sm';
    delBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    delBtn.addEventListener('click', async () => {
      if (!confirm('Ви впевнені, що хочете видалити цю заявку?')) return;
      delBtn.disabled = true;
      try {
        await Supabase.delete('site_leads', row.id);
        toast('Заявку видалено');
        loadSiteLeads();
      } catch (e) {
        toast(e.message, 'error');
        delBtn.disabled = false;
      }
    });

    actionTd.appendChild(sel);
    actionTd.appendChild(delBtn);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });
}

function renderAppointmentsTable(rows) {
  const tbody = document.getElementById('appt-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!rows.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.style.cssText = 'text-align:center;color:var(--text-muted);padding:32px';
    td.textContent = 'Записів не знайдено';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  const statusOptions = [
    ['pending',   'Очікує'],
    ['confirmed', 'Підтверджено'],
    ['completed', 'Завершено'],
    ['cancelled', 'Скасовано'],
  ];
  const statusLabel = Object.fromEntries(statusOptions);

  rows.forEach(row => {
    const tr = document.createElement('tr');
    tr.dataset.id = row.id;
    const status   = row.status || 'pending';
    const dateTime = [row.date, row.time].filter(Boolean).join(' ') || '—';

    [row.name || '—', row.phone || '—', row.service || '—', dateTime].forEach(text => {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    });

    const badgeTd = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'badge badge--' + status;
    badge.textContent = statusLabel[status] || status;
    badgeTd.appendChild(badge);
    tr.appendChild(badgeTd);

    const actionTd = document.createElement('td');
    const sel = document.createElement('select');
    sel.className = 'form-select';
    sel.style.cssText = 'padding:5px 28px 5px 8px;font-size:12px;width:auto;min-width:130px';
    statusOptions.forEach(([val, label]) => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = label;
      if (val === status) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', async () => {
      sel.disabled = true;
      try {
        await Supabase.patch('appointments', row.id, { status: sel.value });
        toast('Статус оновлено');
        loadAppointments();
      } catch (e) {
        toast(e.message, 'error');
        sel.disabled = false;
      }
    });
    actionTd.appendChild(sel);
    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  });
}

/* ============================================================
   APPOINTMENTS GRID (Excel-like)
   ============================================================ */
let currentGridWeekOffset = 0;

function getMonday(d) {
  d = new Date(d);
  let day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6:1);
  return new Date(d.setDate(diff));
}

async function loadAppointmentsGrid() {
  const tbody = document.getElementById('excel-grid-body');
  const theadRow = document.getElementById('excel-grid-head');
  if (!tbody || !theadRow) return;

  // Calculate week dates
  const now = new Date();
  now.setDate(now.getDate() + (currentGridWeekOffset * 7));
  const monday = getMonday(now);
  
  const weekDates = [];
  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d);
  }

  const d1 = weekDates[0];
  const d2 = weekDates[4];
  document.getElementById('grid-week-label').textContent = 
    `${d1.toLocaleDateString('ru-RU', {day:'numeric', month:'short'})} - ${d2.toLocaleDateString('ru-RU', {day:'numeric', month:'short', year:'numeric'})}`;

  // Build Header
  theadRow.innerHTML = '<th class="time-col-header">Час</th>';
  weekDates.forEach((d, i) => {
    const th = document.createElement('th');
    th.innerHTML = `<div>${daysOfWeek[i]}</div><div style="font-size:11px;font-weight:400;color:var(--text-secondary);margin-top:2px;">${d.toLocaleDateString('ru-RU')}</div>`;
    theadRow.appendChild(th);
  });

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted)">Завантаження...</td></tr>';

  try {
    // Format dates as dd.mm.yyyy since that's how the bot stores them in Supabase
    const dateStrings = weekDates.map(d => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    });
    
    const dateQuery = dateStrings.map(d => `"${d}"`).join(',');
    
    // Fetch all appointments for these 5 days using 'in' operator
    const { data } = await Supabase.get('appointments', `?date=in.(${encodeURIComponent(dateQuery)})&select=*`);
    const appts = data || [];
    
    // Map them by date + time
    const map = {};
    appts.forEach(a => {
      const key = `${a.date}_${a.time}`;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });

    // Generate timeslots
    const slots = [];
    for (let h = 8; h <= 10; h++) {
      for (let m = 0; m < 60; m += 15) {
        slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
      }
    }
    for (let h = 11; h <= 17; h++) {
      slots.push(`${String(h).padStart(2,'0')}:00`);
    }

    tbody.innerHTML = '';
    const skipCells = { 0: false, 1: false, 2: false, 3: false, 4: false };

    slots.forEach(timeSlot => {
      const tr = document.createElement('tr');
      const tdTime = document.createElement('td');
      tdTime.className = 'time-col';
      tdTime.textContent = timeSlot;
      tr.appendChild(tdTime);

      for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
        if (skipCells[dayIndex]) {
          skipCells[dayIndex] = false;
          continue;
        }

        const td = document.createElement('td');
        const d = weekDates[dayIndex];
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const dateStr = `${day}.${month}.${year}`;
        const key = `${dateStr}_${timeSlot}`;
        const slotAppts = map[key];

        if (slotAppts && slotAppts.length > 0) {
          // Render multiple if they overlap, but usually it's just 1
          slotAppts.forEach(appt => {
            // Anesthesia rule: if before 11:00 and has 'наркоз' (ignore case), it takes 30 mins (2 slots)
            if (timeSlot < '11:00' && appt.anesthesia && appt.anesthesia.toLowerCase().includes('наркоз')) {
              td.rowSpan = 2;
              skipCells[dayIndex] = true;
            }

            const isDanilo = appt.doctor && appt.doctor.toLowerCase().includes('данило');
            const doctorClass = isDanilo ? 'doctor-danilo' : 'doctor-teternik';
            const statusClass = appt.status === 'cancelled' ? 'status-cancelled' : '';
            
            const card = document.createElement('div');
            card.className = `cell-appt ${doctorClass} ${statusClass}`;
            
            let badgesHTML = '';
            if (appt.anesthesia && appt.anesthesia.toLowerCase().includes('наркоз')) {
              badgesHTML += `<span class="appt-badge anesthesia">Наркоз</span>`;
            }
            if (appt.execution_stage) {
              badgesHTML += `<span class="appt-badge">${escText(appt.execution_stage)}</span>`;
            }

            card.innerHTML = `
              <div class="appt-title" title="${escText(appt.name)}">${escText(appt.name)}</div>
              <div class="appt-sub" style="font-weight:500; color:var(--text-primary)">${escText(appt.service)}</div>
              <div class="appt-sub">
                <span>👨‍⚕️ ${isDanilo ? 'Данило' : 'Тетерник'}</span>
                ${badgesHTML}
              </div>
            `;
            td.appendChild(card);
          });
        }
        
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--danger)">${escText(err.message)}</td></tr>`;
  }
}

// Utility for safe HTML escaping
function escText(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ============================================================
   REVIEWS MODERATION
   ============================================================ */
async function loadReviews() {
  const list = document.getElementById('reviews-list');
  if (!list) return;
  list.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted)">Загрузка...</div>';

  try {
    const { data } = await Supabase.get(
      'reviews',
      '?status=eq.pending&order=created_at.desc&limit=50'
    );
    renderReviews(data || []);

    // Update sidebar badge
    const badge = document.getElementById('reviews-badge');
    if (badge) badge.textContent = (data || []).length || '';
  } catch (err) {
    list.innerHTML = `<div style="padding:32px;text-align:center;color:var(--danger)">${escText(err.message)}</div>`;
  }
}

function renderReviews(reviews) {
  const list = document.getElementById('reviews-list');
  if (!list) return;
  list.innerHTML = '';

  if (!reviews.length) {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg><p>Нет отзывов на модерации</p>`;
    list.appendChild(div);
    return;
  }

  reviews.forEach(review => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.dataset.id = review.id;

    // Avatar letter (first char of name)
    const initial = (review.user_name || '?').charAt(0).toUpperCase();
    const stars = '★'.repeat(Math.min(5, Math.max(1, review.stars || 5))) +
                  '☆'.repeat(5 - Math.min(5, Math.max(1, review.stars || 5)));

    // Build card using textContent for user-supplied fields
    const header = document.createElement('div');
    header.className = 'review-header';

    const meta = document.createElement('div');
    meta.className = 'review-meta';

    const avatar = document.createElement('div');
    avatar.className = 'review-avatar';
    avatar.textContent = initial;

    const info = document.createElement('div');
    const nameEl = document.createElement('div');
    nameEl.className = 'review-name';
    nameEl.textContent = review.user_name || 'Аноним';

    const dateEl = document.createElement('div');
    dateEl.className = 'review-date';
    dateEl.textContent = formatDate(review.created_at);

    info.appendChild(nameEl);
    info.appendChild(dateEl);
    meta.appendChild(avatar);
    meta.appendChild(info);

    const starsEl = document.createElement('div');
    starsEl.className = 'review-stars';
    starsEl.textContent = stars;

    header.appendChild(meta);
    header.appendChild(starsEl);

    const textEl = document.createElement('p');
    textEl.className = 'review-text';
    textEl.textContent = review.text || '';

    const actions = document.createElement('div');
    actions.className = 'review-actions';

    const approveBtn = document.createElement('button');
    approveBtn.className = 'btn btn--success btn--sm';
    approveBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    const approveTxt = document.createElement('span');
    approveTxt.textContent = 'Одобрить';
    approveBtn.appendChild(approveTxt);

    const rejectBtn = document.createElement('button');
    rejectBtn.className = 'btn btn--danger btn--sm';
    rejectBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    const rejectTxt = document.createElement('span');
    rejectTxt.textContent = 'Отклонить';
    rejectBtn.appendChild(rejectTxt);

    approveBtn.addEventListener('click', () => moderateReview(review.id, 'approved', card));
    rejectBtn.addEventListener('click',  () => moderateReview(review.id, 'rejected', card));

    actions.appendChild(approveBtn);
    actions.appendChild(rejectBtn);

    card.appendChild(header);
    card.appendChild(textEl);
    card.appendChild(actions);
    list.appendChild(card);
  });
}

async function moderateReview(id, status, cardEl) {
  try {
    await Supabase.patch('reviews', id, { status });
    toast(status === 'approved' ? 'Отзыв опубликован' : 'Отзыв отклонён', status === 'approved' ? 'success' : 'error');
    cardEl.style.transition = 'opacity 0.3s, transform 0.3s';
    cardEl.style.opacity = '0';
    cardEl.style.transform = 'translateX(20px)';
    setTimeout(() => { cardEl.remove(); updateReviewsBadge(); }, 300);
  } catch (e) {
    toast(e.message, 'error');
  }
}

function updateReviewsBadge() {
  const badge = document.getElementById('reviews-badge');
  const cards = document.querySelectorAll('.review-card');
  if (badge) badge.textContent = cards.length > 0 ? cards.length : '';
}

/* ============================================================
   SCHEDULE
   ============================================================ */
let scheduleData = {};    // { 'YYYY-MM-DD': { is_working, start_time, end_time, slot_minutes, notes } }
let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth(); // 0-indexed
let selectedDate = null;

async function initSchedule() {
  renderCalendar();
  await fetchScheduleMonth();
  renderCalendar();
}

async function fetchScheduleMonth() {
  const firstDay = new Date(calYear, calMonth, 1).toISOString().split('T')[0];
  const lastDay  = new Date(calYear, calMonth + 1, 0).toISOString().split('T')[0];
  try {
    const { data } = await Supabase.get(
      'schedule',
      `?date=gte.${firstDay}&date=lte.${lastDay}&select=*`
    );
    scheduleData = {};
    (data || []).forEach(row => { scheduleData[row.date] = row; });
    renderCalendar();
  } catch { /* silent */ }
}

function renderCalendar() {
  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  // Update month title
  const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь',
                      'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const titleEl = document.getElementById('cal-month-title');
  if (titleEl) titleEl.textContent = `${monthNames[calMonth]} ${calYear}`;

  const firstDayOfMonth = new Date(calYear, calMonth, 1);
  const daysInMonth     = new Date(calYear, calMonth + 1, 0).getDate();
  // Start from Monday (0=Mon ... 6=Sun)
  let startDow = firstDayOfMonth.getDay(); // 0=Sun
  startDow = startDow === 0 ? 6 : startDow - 1;

  const today = new Date().toISOString().split('T')[0];

  // Clear grid (keep day labels — first 7 items)
  const dayLabels = grid.querySelectorAll('.cal-day-name');
  grid.innerHTML = '';
  dayLabels.forEach(el => grid.appendChild(el));

  // Re-add day name labels
  ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].forEach(name => {
    const el = document.createElement('div');
    el.className = 'cal-day-name';
    el.textContent = name;
    grid.appendChild(el);
  });

  // Empty cells before first day
  for (let i = 0; i < startDow; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day cal-day--empty';
    grid.appendChild(el);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const sched   = scheduleData[dateStr];
    const isPast  = dateStr < today;
    const isToday = dateStr === today;
    const isSel   = dateStr === selectedDate;

    const el = document.createElement('div');
    el.className = 'cal-day';
    if (isPast)  el.classList.add('cal-day--past');
    if (isToday) el.classList.add('cal-day--today');
    if (isSel)   el.classList.add('cal-day--selected');
    if (sched) {
      el.classList.add(sched.is_working ? 'cal-day--working' : 'cal-day--day-off');
    }

    el.textContent = day;

    if (!isPast) {
      el.addEventListener('click', () => {
        selectedDate = dateStr;
        renderCalendar();
        openSchedulePanel(dateStr);
      });
    }

    grid.appendChild(el);
  }
}

function openSchedulePanel(dateStr) {
  const panel = document.getElementById('schedule-panel');
  if (!panel) return;

  const sched = scheduleData[dateStr] || {};
  const d = new Date(dateStr + 'T00:00:00');
  const label = d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

  panel.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'schedule-panel-title';
  title.textContent = label.charAt(0).toUpperCase() + label.slice(1);
  panel.appendChild(title);

  // Working toggle
  const toggleRow = document.createElement('div');
  toggleRow.className = 'toggle-row';
  const toggleLabel = document.createElement('span');
  toggleLabel.className = 'toggle-label';
  toggleLabel.textContent = 'Рабочий день';
  const toggleWrap = document.createElement('label');
  toggleWrap.className = 'toggle';
  const toggleInput = document.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.id = 'sched-working';
  toggleInput.checked = sched.is_working !== false;
  const toggleSlider = document.createElement('span');
  toggleSlider.className = 'toggle-slider';
  toggleWrap.appendChild(toggleInput);
  toggleWrap.appendChild(toggleSlider);
  toggleRow.appendChild(toggleLabel);
  toggleRow.appendChild(toggleWrap);
  panel.appendChild(toggleRow);

  // Time row
  const timeRow = document.createElement('div');
  timeRow.className = 'time-row';

  const makeTimeGroup = (labelText, inputId, value) => {
    const group = document.createElement('div');
    group.className = 'form-group';
    const lbl = document.createElement('label');
    lbl.className = 'form-label';
    lbl.htmlFor = inputId;
    lbl.textContent = labelText;
    const inp = document.createElement('input');
    inp.type = 'time';
    inp.id = inputId;
    inp.className = 'form-input';
    inp.value = value || '';
    group.appendChild(lbl);
    group.appendChild(inp);
    return group;
  };

  timeRow.appendChild(makeTimeGroup('Начало', 'sched-start', sched.start_time || '09:00'));
  timeRow.appendChild(makeTimeGroup('Конец',  'sched-end',   sched.end_time   || '17:00'));
  panel.appendChild(timeRow);

  // Slot duration
  const slotGroup = document.createElement('div');
  slotGroup.className = 'form-group';
  const slotLabel = document.createElement('label');
  slotLabel.className = 'form-label';
  slotLabel.htmlFor = 'sched-slot';
  slotLabel.textContent = 'Длительность слота (мин)';
  const slotSel = document.createElement('select');
  slotSel.id = 'sched-slot';
  slotSel.className = 'form-select';
  [15, 20, 30, 45, 60].forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = `${v} мин`;
    if ((sched.slot_minutes || 30) === v) opt.selected = true;
    slotSel.appendChild(opt);
  });
  slotGroup.appendChild(slotLabel);
  slotGroup.appendChild(slotSel);
  panel.appendChild(slotGroup);

  // Notes
  const notesGroup = document.createElement('div');
  notesGroup.className = 'form-group';
  const notesLabel = document.createElement('label');
  notesLabel.className = 'form-label';
  notesLabel.htmlFor = 'sched-notes';
  notesLabel.textContent = 'Заметки';
  const notesInp = document.createElement('input');
  notesInp.type = 'text';
  notesInp.id = 'sched-notes';
  notesInp.className = 'form-input';
  notesInp.value = sched.notes || '';
  notesGroup.appendChild(notesLabel);
  notesGroup.appendChild(notesInp);
  panel.appendChild(notesGroup);

  // Save button
  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn--primary btn--full';
  const saveTxt = document.createElement('span');
  saveTxt.textContent = 'Сохранить';
  saveBtn.appendChild(saveTxt);
  saveBtn.style.marginTop = '8px';

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveTxt.textContent = 'Сохранение...';
    try {
      const payload = {
        date:         dateStr,
        is_working:   document.getElementById('sched-working').checked,
        start_time:   document.getElementById('sched-start').value,
        end_time:     document.getElementById('sched-end').value,
        slot_minutes: parseInt(document.getElementById('sched-slot').value, 10),
        notes:        document.getElementById('sched-notes').value,
      };
      await Supabase.upsert('schedule', payload);
      scheduleData[dateStr] = payload;
      renderCalendar();
      toast('Расписание сохранено');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveTxt.textContent = 'Сохранить';
    }
  });

  panel.appendChild(saveBtn);
}

/* ============================================================
   HELPERS
   ============================================================ */
function escText(str) {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function skeletonRows(rows, cols) {
  let html = '';
  for (let r = 0; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) {
      html += `<td><div class="skeleton" style="height:14px;width:${60+Math.random()*30}%;border-radius:4px"></div></td>`;
    }
    html += '</tr>';
  }
  return html;
}

function renderPagination(containerId, total, currentPage, pageSize, onPage) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return;

  const makeBtn = (label, page, disabled = false, active = false) => {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (active ? ' active' : '');
    btn.disabled = disabled;
    btn.textContent = label;
    if (!disabled) btn.addEventListener('click', () => onPage(page));
    return btn;
  };

  container.appendChild(makeBtn('‹', currentPage - 1, currentPage === 1));
  for (let p = 1; p <= Math.min(pages, 7); p++) {
    container.appendChild(makeBtn(p, p, false, p === currentPage));
  }
  container.appendChild(makeBtn('›', currentPage + 1, currentPage === pages));
}

/* ============================================================
   INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Try restore session
  const hasSession = Supabase.restoreSession();
  if (hasSession) {
    showApp(sessionStorage.getItem('admin_email') || '');
  }

  // Restore Sidebar State
  const sidebar = document.querySelector('.sidebar');
  if (localStorage.getItem('sidebar_collapsed') === 'true') {
    sidebar?.classList.add('collapsed');
  }

  // Sidebar Toggle
  document.getElementById('sidebar-toggle-btn')?.addEventListener('click', () => {
    sidebar?.classList.toggle('collapsed');
    localStorage.setItem('sidebar_collapsed', sidebar?.classList.contains('collapsed'));
  });

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailEl = document.getElementById('login-email');
      const passEl  = document.getElementById('login-password');
      const errEl   = document.getElementById('login-error');
      const btn     = loginForm.querySelector('button[type="submit"]');

      if (errEl) errEl.textContent = '';
      btn.disabled = true;
      btn.textContent = 'Входим...';

      try {
        const data = await Supabase.login(emailEl.value.trim(), passEl.value);
        showApp(data.user?.email || emailEl.value.trim());
      } catch (err) {
        if (errEl) errEl.textContent = err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Войти';
      }
    });
  }

  // Nav items
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo(btn.dataset.page);
      // Close sidebar on mobile
      document.querySelector('.sidebar')?.classList.remove('open');
      document.querySelector('.sidebar-overlay')?.classList.remove('visible');
    });
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await Supabase.logout();
    location.reload();
  });

  // Refresh
  document.getElementById('refresh-btn')?.addEventListener('click', () => {
    const btn = document.getElementById('refresh-btn');
    btn?.classList.add('spinning');
    
    let isGrid = document.getElementById('appt-grid-view')?.style.display !== 'none';
    const load = { 
      dashboard: loadAnalytics, 
      marketing: loadMarketingAnalytics,
      appointments: isGrid ? loadAppointmentsGrid : loadAppointments, 
      reviews: loadReviews, 
      schedule: window.initSchedule,
      'premium-dashboard': loadPremiumAppointments,
      'patient-history': () => {
        const input = document.getElementById('patient-search-input');
        if (input && input.value.trim().length > 0) {
          return searchPatientHistory();
        }
      }
    };
    
    // Call the corresponding function, fallback to loadAnalytics if not found
    const loadFn = load[currentPage] || loadAnalytics;
    
    // Some functions might be undefined (like old initSchedule), so check first
    if (typeof loadFn === 'function') {
      Promise.resolve(loadFn()).finally(() => btn?.classList.remove('spinning'));
    } else {
      btn?.classList.remove('spinning');
    }
  });

  // View Toggles (List / Grid)
  document.getElementById('btn-view-list')?.addEventListener('click', () => {
    document.getElementById('btn-view-list').classList.add('active');
    document.getElementById('btn-view-grid').classList.remove('active');
    document.getElementById('appt-list-view').style.display = '';
    document.getElementById('appt-grid-view').style.display = 'none';
    loadAppointments();
  });
  document.getElementById('btn-view-grid')?.addEventListener('click', () => {
    document.getElementById('btn-view-grid').classList.add('active');
    document.getElementById('btn-view-list').classList.remove('active');
    document.getElementById('appt-list-view').style.display = 'none';
    document.getElementById('appt-grid-view').style.display = '';
    loadAppointmentsGrid();
  });
  document.getElementById('grid-prev-week')?.addEventListener('click', () => {
    currentGridWeekOffset--;
    loadAppointmentsGrid();
  });
  document.getElementById('grid-next-week')?.addEventListener('click', () => {
    currentGridWeekOffset++;
    loadAppointmentsGrid();
  });

  // Appointment filters
  document.querySelectorAll('.appt-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.appt-filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      apptFilter = tab.dataset.filter;
      apptPage = 1;
      loadAppointments();
    });
  });

  // Appointment search
  let searchTimer;
  document.getElementById('appt-search')?.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      apptSearch = e.target.value.trim();
      apptPage = 1;
      loadAppointments();
    }, 400);
  });

  // Calendar navigation
  document.getElementById('cal-prev')?.addEventListener('click', async () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    selectedDate = null;
    await fetchScheduleMonth();
    resetSchedulePanel();
  });

  document.getElementById('cal-next')?.addEventListener('click', async () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    selectedDate = null;
    await fetchScheduleMonth();
    resetSchedulePanel();
  });

  // Mobile menu
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.querySelector('.sidebar')?.classList.toggle('open');
    document.querySelector('.sidebar-overlay')?.classList.toggle('visible');
  });
  document.querySelector('.sidebar-overlay')?.addEventListener('click', () => {
    document.querySelector('.sidebar')?.classList.remove('open');
    document.querySelector('.sidebar-overlay')?.classList.remove('visible');
  });
});

function showApp(email) {
  document.getElementById('login-screen').style.display = 'none';
  const appEl = document.getElementById('app');
  appEl.style.display = '';        // ← снимаем инлайновый display:none
  appEl.classList.add('visible');  // ← CSS-класс теперь работает
  const emailEl = document.getElementById('admin-email');
  if (emailEl) emailEl.textContent = email;
  const avatarEl = document.getElementById('admin-avatar');
  if (avatarEl) avatarEl.textContent = email.charAt(0).toUpperCase();
  navigateTo('dashboard');

  // Fetch pending reviews count for sidebar badge
  Supabase.get('reviews', '?status=eq.pending&select=id').then(({ total }) => {
    const badge = document.getElementById('reviews-badge');
    if (badge && total > 0) {
      badge.textContent = total;
      badge.style.display = '';
    }
  }).catch(() => {});

  // Fetch site leads count
  Supabase.get('site_leads', '?status=eq.pending&select=id').then(({ total }) => {
    const badge = document.getElementById('site-leads-badge');
    if (badge && total > 0) {
      badge.textContent = total;
      badge.style.display = '';
    }
  }).catch(() => {});
}

function resetSchedulePanel() {
  const panel = document.getElementById('schedule-panel');
  if (panel) {
    panel.innerHTML = '<p>Выберите день в календаре для настройки расписания</p>';
  }
}

/* ============================================================
   PREMIUM DASHBOARD (SCHEDULE)
   ============================================================ */
let supabaseClient = null;
let pdRealtimeChannel = null;

let currentPremiumGridWeekOffset = 0;

function cleanTimeStr(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  return `${parts[0].trim().padStart(2, '0')}:${parts[1].trim().padStart(2, '0')}`;
}

function getWeekDates(offset) {
  const now = new Date();
  now.setDate(now.getDate() + (offset * 7));
  const monday = getMonday(now);
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d);
  }
  return weekDates;
}

let syncTimerInterval = null;

function updateSyncStatus(text, isError = false) {
  const el = document.getElementById('pd-sync-status');
  if (el) {
    el.innerHTML = text;
    el.style.color = isError ? 'var(--danger)' : 'var(--text-muted)';
  }
}

function startSyncCountdown(seconds) {
  if (syncTimerInterval) clearInterval(syncTimerInterval);
  
  let left = seconds;
  updateSyncStatus(`⏳ Наступна доступна через: <b>${left}</b> сек`);
  
  syncTimerInterval = setInterval(() => {
    left--;
    if (left <= 0) {
      clearInterval(syncTimerInterval);
      updateSyncStatus(`Готово до синхронізації`);
    } else {
      updateSyncStatus(`⏳ Наступна доступна через: <b>${left}</b> сек`);
    }
  }, 1000);
}

async function triggerBotSync(dateStr = '', offset = 0) {
  if (offset < 0) {
    console.log(`✅ Пропуск синхронизации для прошедших недель (${dateStr})`);
    updateSyncStatus(`✅ Минулі тижні не синхронізуються`);
    if (syncTimerInterval) clearInterval(syncTimerInterval);
    return;
  }

  if (!CFG.botUrl || !CFG.botSecret) {
    console.log('ℹ️ Bot URL or Secret not configured, skipping on-demand sync.');
    updateSyncStatus(`⚠️ Синхронізація недоступна`, true);
    return;
  }
  
  // Rate limiting: 30 seconds global cooldown for any week
  const now = Date.now();
  const cacheKey = `lastBotSync_global`;
  const lastSync = parseInt(sessionStorage.getItem(cacheKey) || '0', 10);
  const timePassed = now - lastSync;
  
  if (timePassed < 30000) {
    const timeLeft = Math.ceil((30000 - timePassed) / 1000);
    console.log(`⏳ Bot sync was recently triggered. Skipping.`);
    startSyncCountdown(timeLeft);
    return;
  }
  
  sessionStorage.setItem(cacheKey, now.toString());
  console.log(`⏳ Triggering Google Sheets sync for ${dateStr || 'current'} via Telegram Bot API...`);
  
  startSyncCountdown(30);
  
  try {
    const url = `${CFG.botUrl}/api/trigger-sync?secret=${CFG.botSecret}` + (dateStr ? `&date=${dateStr}` : '');
    const res = await fetch(url);
    const data = await res.json();
    console.log('🤖 Telegram Bot sync triggered successfully:', data);
  } catch (err) {
    console.error('❌ Failed to trigger Telegram Bot sync:', err);
    updateSyncStatus(`❌ Помилка синхронізації`, true);
  }
}

function initPremiumDashboard() {
  if (window.supabase) {
    const token = sessionStorage.getItem('admin_token') || Supabase._token;
    const options = {};
    if (token) {
      options.global = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
    }
    if (pdRealtimeChannel && supabaseClient) {
      supabaseClient.removeChannel(pdRealtimeChannel);
      pdRealtimeChannel = null;
    }
    supabaseClient = window.supabase.createClient(CFG.url, CFG.anonKey, options);
  }

  // Setup event listeners for filters
  document.getElementById('pd-doctor-filter')?.addEventListener('change', loadPremiumAppointments);
  
  document.getElementById('pd-prev-week')?.addEventListener('click', () => {
    currentPremiumGridWeekOffset--;
    loadPremiumAppointments();
  });
  
  document.getElementById('pd-next-week')?.addEventListener('click', () => {
    currentPremiumGridWeekOffset++;
    loadPremiumAppointments();
  });

  loadPremiumAppointments();

  // Setup Realtime
  setupPremiumRealtime();
}

async function loadPremiumAppointments() {
  const wrapper = document.getElementById('pd-grid-wrapper');
  const emptyState = document.getElementById('pd-empty-state');
  
  if (!wrapper) return;
  
  // Update week label
  const weekDates = getWeekDates(currentPremiumGridWeekOffset);
  
  // Trigger Google Sheets parsing asynchronously for this week
  const monday = weekDates[0];
  const day = String(monday.getDate()).padStart(2, '0');
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const year = monday.getFullYear();
  const dateStr = `${day}.${month}.${year}`;
  triggerBotSync(dateStr, currentPremiumGridWeekOffset);
  const d1 = weekDates[0];
  const d2 = weekDates[6];
  const labelEl = document.getElementById('pd-week-label');
  if (labelEl) {
    labelEl.textContent = `${d1.toLocaleDateString('ru-RU', {day:'numeric', month:'short'})} — ${d2.toLocaleDateString('ru-RU', {day:'numeric', month:'short'})}`;
  }

  wrapper.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-muted)">Завантаження розкладу...</div>';
  wrapper.style.display = 'block';
  if(emptyState) emptyState.style.display = 'none';

  const doctorFilter = document.getElementById('pd-doctor-filter')?.value;

  try {
    // Format dates as DD.MM.YYYY
    const dateStrings = weekDates.map(d => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    });
    
    // According to instructions: status in ('confirmed', 'pending')
    console.log('⏳ Відправка запиту до Supabase для дат:', dateStrings);
    let query = supabaseClient
      .from('appointments')
      .select('*')
      .in('status', ['confirmed', 'pending'])
      .in('date', dateStrings);

    if (doctorFilter && doctorFilter !== 'all') {
      query = query.ilike('doctor', `%${doctorFilter}%`);
    }

    // Добавляем таймаут для предотвращения бесконечного зависания
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Перевищено час очікування від Supabase (10 секунд)')), 10000));
    
    const { data, error } = await Promise.race([query, timeout]);
    if (error) {
      if (error.status === 401 || error.code === '401' || error.message?.includes('JWT')) {
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_email');
        location.reload();
      }
      throw error;
    }
    
    console.log('✅ Fetched Appointments for week:', data);

    renderPremiumGrid(data || [], weekDates);
  } catch (err) {
    console.error('❌ Error fetching appointments:', err);
    wrapper.innerHTML = `<div style="padding:40px; text-align:center; color:var(--danger)">Помилка завантаження: ${err.message}</div>`;
  }
}

function renderPremiumGrid(appointments, weekDates) {
  const wrapper = document.getElementById('pd-grid-wrapper');
  const emptyState = document.getElementById('pd-empty-state');
  
  if (!wrapper) return;

  if (!appointments || appointments.length === 0) {
    wrapper.style.display = 'none';
    if(emptyState) emptyState.style.display = 'block';
    return;
  }

  wrapper.style.display = 'block';
  if(emptyState) emptyState.style.display = 'none';

  // Map them by date + time (normalization to HH:MM)
  const map = {};
  appointments.forEach(a => {
    const cleanTime = cleanTimeStr(a.time);
    if (!cleanTime) return;
    const key = `${a.date}_${cleanTime}`;
    if (!map[key]) map[key] = [];
    map[key].push(a);
    console.log(`📍 Mapped appointment ${a.name} (${a.time}) -> Slot ${cleanTime}`);
  });

  // Generate timeslots
  // 08:00 to 10:45 (every 15 min), then 11:00 to 16:00 (every 1 hr)
  const slots = [];
  for (let h = 8; h <= 10; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 10 && m > 45) continue; // up to 10:45
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    }
  }
  for (let h = 11; h <= 16; h++) {
    slots.push(`${String(h).padStart(2,'0')}:00`);
  }

  // Create Table Base
  const table = document.createElement('table');
  table.className = 'pd-excel-grid';

  // Header Row
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.innerHTML = '<th class="pd-time-col-header">Час</th>';
  
  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
  weekDates.forEach((d, i) => {
    const th = document.createElement('th');
    th.innerHTML = `
      <div class="day-name">${daysOfWeek[i]}</div>
      <div style="font-size:11px; font-weight:400; opacity:0.7">${d.toLocaleDateString('ru-RU')}</div>
    `;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  
  // Track skip cells due to rowspan
  const skipCells = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };

  slots.forEach(timeSlot => {
    const tr = document.createElement('tr');
    
    // Time cell
    const tdTime = document.createElement('td');
    tdTime.className = 'pd-time-col';
    tdTime.textContent = timeSlot;
    tr.appendChild(tdTime);

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      if (skipCells[dayIndex]) {
        skipCells[dayIndex] = false;
        continue;
      }

      const td = document.createElement('td');
      td.className = 'pd-cell';
      
      const d = weekDates[dayIndex];
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const dateStr = `${day}.${month}.${year}`;
      const key = `${dateStr}_${timeSlot}`;
      const slotAppts = map[key];

      if (slotAppts && slotAppts.length > 0) {
        slotAppts.forEach(appt => {
          // Anesthesia rule: if before 11:00 and has 'наркоз' (ignore case), it takes 2 slots (rowSpan=2)
          if (timeSlot < '11:00' && appt.anesthesia && appt.anesthesia.toLowerCase().includes('наркоз')) {
            td.rowSpan = 2;
            skipCells[dayIndex] = true;
          }

          const rawDoc = (appt.doctor || '').trim();
          const docLower = rawDoc.toLowerCase();
          
          let docClass = '';
          let docName = rawDoc || 'Не вказано';

          if (docLower.includes('данило') || docLower === 'д.о.' || docLower.includes('рома')) {
            docClass = 'doc-danilo';
            docName = 'Данило Рома';
          } else if (docLower.includes('тетернік') || docLower.includes('тетерник') || docLower === 'о.о.' || (!rawDoc && !docLower)) {
            // Default to Oleg Olegovich if it's explicitly him or empty (fallback for older DB entries)
            // If they have "Влада терапевт" it won't match here and will just show "Влада терапевт" with default blue border
            docClass = 'doc-teternik';
            docName = rawDoc ? rawDoc : 'Тетерник';
            // Wait, if it's explicitly Oleg Olegovich, standardize it:
            if (!rawDoc || docLower.includes('тетернік') || docLower.includes('тетерник') || docLower === 'о.о.') {
                docName = 'Тетерник';
            }
          }
          
          let badgesHtml = '';
          if (appt.execution_stage) {
            const stageClass = appt.execution_stage.toLowerCase().replace(/\s+/g, '-');
            badgesHtml += `<span class="pd-badge stage-${stageClass}">${escText(window.getFriendlyExecutionStage(appt.execution_stage))}</span>`;
          }
          if (appt.anesthesia && appt.anesthesia.toLowerCase().includes('наркоз')) {
            badgesHtml += `<span class="pd-badge anesthesia">Наркоз</span>`;
          }

          const card = document.createElement('div');
          card.className = `pd-card ${docClass}`;
          
          card.innerHTML = `
            <div class="pd-card-top">
              <div class="pd-time">${escText(appt.time || '--:--')}</div>
              <div class="pd-badges">${badgesHtml}</div>
            </div>
            <div class="pd-card-body">
              <div class="pd-service">${escText(appt.service || 'Процедура не вказана')}</div>
              <div class="pd-patient-name">${escText(appt.name || 'Анонім')}</div>
              ${appt.phone && appt.phone !== 'Ручний запис' ? `<div style="margin-top:4px;"><a href="#" onclick="window.openPatientHistory('${escText(appt.phone)}'); return false;" style="color:var(--text-muted); font-size:12px; text-decoration:none; display:flex; align-items:center; gap:4px;">📜 Історія: ${escText(appt.phone)}</a></div>` : ''}
            </div>
            <div class="pd-card-footer">
              <div class="pd-doctor-name">👨‍⚕️ ${escText(docName)}</div>
            </div>
          `;
          
          td.appendChild(card);
        });
      }
      
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.innerHTML = '';
  wrapper.appendChild(table);
}

/* ============================================================
   PATIENT HISTORY
   ============================================================ */

window.openPatientHistory = function(query) {
  if (!query || query === 'Ручний запис') return;
  
  // Navigate to history tab
  navigateTo('patient-history');
  
  // Wait for the view to render, then populate input and trigger search
  setTimeout(() => {
    const input = document.getElementById('patient-search-input');
    if (input) {
      input.value = query;
      searchPatientHistory();
    }
  }, 50);
};

let currentPatientHistoryMatches = [];

function initPatientHistory() {
  const searchBtn = document.getElementById('btn-patient-search');
  const searchInput = document.getElementById('patient-search-input');
  
  if (searchBtn && !searchBtn.dataset.listener) {
    searchBtn.addEventListener('click', searchPatientHistory);
    searchBtn.dataset.listener = 'true';
  }
  
  if (searchInput && !searchInput.dataset.listener) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchPatientHistory();
    });
    searchInput.dataset.listener = 'true';
  }
}

async function searchPatientHistory() {
  const input = document.getElementById('patient-search-input');
  const query = (input.value || '').trim();
  
  if (!query) {
    toast('Введіть номер телефону або ім\'я', 'error');
    return;
  }
  
  const searchBtn = document.getElementById('btn-patient-search');
  const emptyState = document.getElementById('patient-history-empty');
  const content = document.getElementById('patient-history-content');
  
  if (searchBtn) {
    searchBtn.textContent = 'Пошук...';
    searchBtn.disabled = true;
  }
  
  try {
    const digits = query.replace(/\D/g, '');
    const isPhoneSearch = digits.length >= 7;
    
    let dbQuery = '?select=*&order=date.desc,time.desc';
    
    if (isPhoneSearch && digits.length >= 9) {
      const last9 = digits.slice(-9);
      // Create wildcard query like *66*407*25*54* to match any formatting
      const wildcard = '*' + last9.substring(0, 2) + '*' + last9.substring(2, 5) + '*' + last9.substring(5, 7) + '*' + last9.substring(7, 9) + '*';
      dbQuery += `&or=(phone.ilike.${wildcard},name.ilike.${wildcard})`;
    } else {
      const cleanQuery = query.replace(/[^\d\w\sа-яА-ЯіІїЇєЄґҐ]/g, '');
      dbQuery += `&or=(name.ilike.*${cleanQuery}*,phone.ilike.*${cleanQuery}*)`;
    }

    const { data, total } = await Supabase.get('appointments', dbQuery);
    
    const grouped = {};
    (data || []).forEach(appt => {
      const ph = appt.phone && appt.phone !== 'Ручний запис' ? appt.phone : null;
      const key = ph || appt.name.toLowerCase().trim();
      
      if (!grouped[key]) {
        grouped[key] = {
          phone: ph,
          name: appt.name,
          visits: []
        };
      }
      grouped[key].visits.push(appt);
    });
    
    currentPatientHistoryMatches = Object.values(grouped);
    
    if (currentPatientHistoryMatches.length === 0) {
      content.style.display = 'none';
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      content.style.display = 'block';
      renderPatientHistoryMatches();
    }
    
  } catch (err) {
    console.error('Пошук помилка:', err);
    toast('Помилка пошуку: ' + err.message, 'error');
  } finally {
    if (searchBtn) {
      searchBtn.textContent = 'Знайти';
      searchBtn.disabled = false;
    }
  }
}

function renderPatientHistoryMatches() {
  const listEl = document.getElementById('patient-matches-list');
  listEl.innerHTML = '';
  
  currentPatientHistoryMatches.forEach((match, idx) => {
    const div = document.createElement('div');
    div.className = 'match-item' + (idx === 0 ? ' active' : '');
    div.innerHTML = `
      <div class="match-name">${escText(match.name)}</div>
      <div class="match-phone">${match.phone ? escText(match.phone) : 'Телефон не вказано'}</div>
      <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Візитів: ${match.visits.length}</div>
    `;
    
    div.addEventListener('click', () => {
      document.querySelectorAll('.match-item').forEach(el => el.classList.remove('active'));
      div.classList.add('active');
      renderPatientHistoryTimeline(match);
    });
    
    listEl.appendChild(div);
  });
  
  if (currentPatientHistoryMatches.length > 0) {
    renderPatientHistoryTimeline(currentPatientHistoryMatches[0]);
  }
}

window.getFriendlyExecutionStage = function(stage) {
  if (!stage) return 'Заплановано';
  const clean = stage.trim().toLowerCase().replace(/_/g, ' ');
  const map = {
    'scheduled': 'Заплановано',
    'confirmed': 'Підтверджено',
    'in process': 'В процесі',
    'in_process': 'В процесі',
    'executed': 'Виконано',
    'no show': 'Не з\'явився',
    'no_show': 'Не з\'явився',
    'cancelled': 'Скасовано',
    'cancelled notified': 'Скасовано (сповіщено)',
    'cancelled_notified': 'Скасовано (сповіщено)',
    'rescheduled': 'Перенесено',
    'waiting list': 'Лист очікування',
    'waiting_list': 'Лист очікування'
  };
  return map[stage.trim()] || map[clean] || stage;
};

function renderPatientHistoryTimeline(match) {
  document.getElementById('ph-name').textContent = match.name || 'Анонім';
  document.getElementById('ph-phone').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> <span>${match.phone ? escText(match.phone) : 'Не вказано'}</span>`;
  document.getElementById('ph-total-visits').textContent = match.visits.length;
  
  const container = document.getElementById('patient-timeline');
  container.innerHTML = '';
  
  match.visits.forEach(appt => {
    const d = parseApptDate(appt.date);
    const dateDisplay = d ? d.toLocaleDateString('uk-UA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : appt.date;
    
    const stageClass = appt.execution_stage ? appt.execution_stage.toLowerCase().replace(/\s+/g, '-') : 'none';
    
    const html = `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-date">${dateDisplay} о ${appt.time || '--:--'}</div>
        <div class="timeline-content">
          <div class="timeline-row">
            <div class="tl-label">Лікар</div>
            <div class="tl-value">👨‍⚕️ ${escText(appt.doctor || 'Не вказано')}</div>
          </div>
          <div class="timeline-row">
            <div class="tl-label">Послуга</div>
            <div class="tl-value">${escText(appt.service || 'Не вказано')}</div>
          </div>
          <div class="timeline-row">
            <div class="tl-label">Наркоз</div>
            <div class="tl-value">${escText(appt.anesthesia || 'Без наркозу')}</div>
          </div>
          <div class="timeline-row" style="margin-top: 12px; border-top: 1px dashed var(--border); padding-top: 8px;">
            <div class="tl-label">Статус виконання</div>
            <div class="tl-value">
               <span class="pd-badge stage-${stageClass}" style="font-size: 11px;">${escText(window.getFriendlyExecutionStage(appt.execution_stage))}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}

function setupPremiumRealtime() {
  if (!supabaseClient) return;
  if (pdRealtimeChannel) {
    supabaseClient.removeChannel(pdRealtimeChannel);
  }

  pdRealtimeChannel = supabaseClient.channel('premium-dashboard-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'appointments' },
      (payload) => {
        if (currentPage === 'premium-dashboard') {
          console.log('🔄 Realtime update received:', payload);
          loadPremiumAppointments();
        }
      }
    )
    .subscribe();
}
