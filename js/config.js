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
  },

  // ──────────────────────────────────────────────
  //  СТАТИСТИКА
  // ──────────────────────────────────────────────
  stats: {
    experience:          8,
    
    // БАЗА ДАНИХ: вимикаємо через сміття в таблиці
    patientsFromSupabase: false,

    // АЛГОРИТМІЧНИЙ ЛІЧИЛЬНИК (Розумний підрахунок без БД)
    smartCounter: {
      enabled: false,
      baseDate: '2026-02-01', // Точка відліку
      baseCount: 3000,        // Точне стартове число
      patientsPerMonth: 0,   // Середня к-ть пацієнтів на місяць
    },

    patientsStaticCount:  3000,
    patientsSince:        'лютого 2026',
    patientsSinceEn:      'February 2026',
  },

  // ──────────────────────────────────────────────
  //  TELEGRAM BOT — публічне посилання (не секрет)
  //  Просто вставте посилання на вашого бота:
  // ──────────────────────────────────────────────
  telegram: {
    botLink: 'https://t.me/AppointmentEndoscopyBot',
  },
};
