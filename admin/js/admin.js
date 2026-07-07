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
    'premium-dashboard': 'Розклад Прийомів (Premium)',
    appointments: 'Заявки на прием',
    reviews:      'Модерация отзывов',
  };
  const titleEl = document.getElementById('top-bar-title');
  if (titleEl) titleEl.textContent = titles[page] || page;

  // Load data for the active section
  if (page === 'dashboard')    loadDashboard();
  if (page === 'appointments') loadAppointments();
  if (page === 'reviews')      loadReviews();
  if (page === 'premium-dashboard') initPremiumDashboard();
}

/* ============================================================
   DASHBOARD — ANALYTICS
   ============================================================ */
let visitsLineChart = null;
let platformPieChart = null;

async function loadDashboard() {
  // ── Stats cards ──────────────────────────────────────────
  try {
    const stats = await Supabase.rpc('get_visit_stats');
    setStatCard('stat-total',   stats.total  ?? '—');
    setStatCard('stat-today',   stats.today  ?? '—');
    setStatCard('stat-week',    stats.week   ?? '—');
    setStatCard('stat-month',   stats.month  ?? '—');
    setStatCard('stat-unique',  stats.unique ?? '—');
  } catch {
    ['stat-total','stat-today','stat-week','stat-month','stat-unique']
      .forEach(id => setStatCard(id, '—'));
  }

  // ── Visits per day (last 30 days) ────────────────────────
  try {
    const { data } = await Supabase.get(
      'site_visits',
      `?select=created_at&created_at=gte.${daysAgo(30)}&order=created_at.asc`
    );
    renderVisitsChart(data || []);
  } catch { /* silent */ }

  // ── Platform breakdown ───────────────────────────────────
  try {
    const { data } = await Supabase.get('site_visits', '?select=platform');
    renderPlatformChart(data || []);
  } catch { /* silent */ }

  // ── Countries table ──────────────────────────────────────
  try {
    const { data } = await Supabase.get(
      'site_visits',
      '?select=country,country_code&country=not.is.null'
    );
    renderGeoTable('countries-tbody', groupCount(data, 'country'));
  } catch { /* silent */ }

  // ── Cities table ─────────────────────────────────────────
  try {
    const { data } = await Supabase.get(
      'site_visits',
      '?select=city&city=not.is.null'
    );
    renderGeoTable('cities-tbody', groupCount(data, 'city'));
  } catch { /* silent */ }

  // ── Pending appointments (unprocessed from bot) ───────────
  try {
    const { total } = await Supabase.get(
      'appointments',
      '?status=eq.pending&select=id'
    );
    setStatCard('stat-new-appts', total ?? 0);
  } catch { /* silent */ }
}

function setStatCard(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value.toLocaleString ? value.toLocaleString('ru-RU') : value;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function groupCount(arr, key) {
  const map = {};
  arr.forEach(item => {
    const val = item[key];
    if (val) map[val] = (map[val] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}

function renderGeoTable(tbodyId, entries) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!entries.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 2;
    td.textContent = 'Нет данных';
    td.style.cssText = 'text-align:center;color:var(--text-muted);padding:20px';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }
  const total = entries.reduce((s, [, c]) => s + c, 0);
  entries.forEach(([name, count]) => {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    td1.textContent = name;
    td2.innerHTML = `<span style="color:var(--text-secondary)">${count}</span>
      <span style="color:var(--text-muted);font-size:11px;margin-left:6px">(${Math.round(count/total*100)}%)</span>`;
    tr.appendChild(td1);
    tr.appendChild(td2);
    tbody.appendChild(tr);
  });
}

function renderVisitsChart(data) {
  const ctx = document.getElementById('chart-visits');
  if (!ctx || !window.Chart) return;

  // Group by date
  const map = {};
  data.forEach(row => {
    const d = row.created_at?.split('T')[0];
    if (d) map[d] = (map[d] || 0) + 1;
  });
  // Fill last 14 days
  const labels = [];
  const values = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    labels.push(d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }));
    values.push(map[key] || 0);
  }

  if (visitsLineChart) visitsLineChart.destroy();
  visitsLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Визиты',
        data: values,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointRadius: 3,
        pointHoverRadius: 5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8b93a8', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8b93a8', font: { size: 11 }, precision: 0 }, beginAtZero: true },
      },
    },
  });
}

function renderPlatformChart(data) {
  const ctx = document.getElementById('chart-platform');
  if (!ctx || !window.Chart) return;

  const map = { Mobile: 0, Desktop: 0, Tablet: 0 };
  data.forEach(r => { if (r.platform && map[r.platform] !== undefined) map[r.platform]++; });

  if (platformPieChart) platformPieChart.destroy();
  platformPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(map),
      datasets: [{
        data: Object.values(map),
        backgroundColor: ['#6366f1', '#38bdf8', '#f59e0b'],
        borderColor: '#1a1e2a',
        borderWidth: 3,
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#8b93a8', padding: 16, font: { size: 12 } },
        },
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
      dashboard: loadDashboard, 
      appointments: isGrid ? loadAppointmentsGrid : loadAppointments, 
      reviews: loadReviews, 
      schedule: initSchedule 
    };
    
    Promise.resolve((load[currentPage] || loadDashboard)()).finally(() => btn?.classList.remove('spinning'));
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

async function triggerBotSync() {
  if (!CFG.botUrl || !CFG.botSecret) {
    console.log('ℹ️ Bot URL or Secret not configured, skipping on-demand sync.');
    return;
  }
  
  console.log('⏳ Triggering Google Sheets sync via Telegram Bot API...');
  try {
    const res = await fetch(`${CFG.botUrl}/api/trigger-sync?secret=${CFG.botSecret}`);
    const data = await res.json();
    console.log('🤖 Telegram Bot sync triggered successfully:', data);
  } catch (err) {
    console.error('❌ Failed to trigger Telegram Bot sync:', err);
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

  // Trigger Google Sheets parsing asynchronously
  triggerBotSync();
}

async function loadPremiumAppointments() {
  const wrapper = document.getElementById('pd-grid-wrapper');
  const emptyState = document.getElementById('pd-empty-state');
  
  if (!wrapper) return;
  
  // Update week label
  const weekDates = getWeekDates(currentPremiumGridWeekOffset);
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
    if (error) throw error;
    
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

          const isDanilo = appt.doctor && appt.doctor.toLowerCase().includes('данило');
          const docClass = isDanilo ? 'doc-danilo' : 'doc-teternik';
          const docName = isDanilo ? 'Тетернік Д.О.' : 'Тетернік О.О.';
          
          let badgesHtml = '';
          if (appt.execution_stage) {
            const stageClass = appt.execution_stage.toLowerCase().replace(/\s+/g, '-');
            badgesHtml += `<span class="pd-badge stage-${stageClass}">${escText(appt.execution_stage)}</span>`;
          }
          if (appt.anesthesia && appt.anesthesia.toLowerCase().includes('наркоз')) {
            badgesHtml += `<span class="pd-badge anesthesia">Наркоз</span>`;
          }

          const card = document.createElement('div');
          card.className = `pd-card ${docClass}`;
          
          card.innerHTML = `
            <div class="pd-card-header">
              <div class="pd-time">${escText(appt.time || '--:--')}</div>
              <div class="pd-badges">${badgesHtml}</div>
            </div>
            <div class="pd-patient">
              <div class="pd-service">${escText(appt.service || 'Процедура не вказана')}</div>
              <div class="pd-patient-name">${escText(appt.name || 'Анонім')}</div>
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
