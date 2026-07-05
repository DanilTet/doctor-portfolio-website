/**
 * config.js — Site Configuration
 * Reads secrets from js/env.js (gitignored, never committed)
 *
 * Щоб підключити Supabase:
 *   1. Відкрийте js/env.js
 *   2. Вставте реальні значення SUPABASE_URL і SUPABASE_ANON_KEY
 *   3. Збережіть — готово!
 */

// Читаємо секрети з env.js (або використовуємо безпечні порожні значення)
const ENV = window.ENV || {};

const SITE_CONFIG = {
  // ──────────────────────────────────────────────
  //  SUPABASE — підключається через js/env.js
  // ──────────────────────────────────────────────
  supabase: {
    url:               ENV.SUPABASE_URL      || '',
    anonKey:           ENV.SUPABASE_ANON_KEY || '',
    appointmentsTable: 'appointments',
    dateColumn:        'created_at',
    countFrom:         '2026-02-01',
  },

  // ──────────────────────────────────────────────
  //  СТАТИСТИКА
  // ──────────────────────────────────────────────
  stats: {
    experience:          45,
    patientsFromSupabase: true,
    patientsStaticCount:  1200,
    patientsSince:        'лютого 2026',
    patientsSinceEn:      'February 2026',
  },

  // ──────────────────────────────────────────────
  //  TELEGRAM BOT — підключається через js/env.js
  // ──────────────────────────────────────────────
  telegram: {
    botLink: ENV.TELEGRAM_BOT_LINK || '#',
  },
};
