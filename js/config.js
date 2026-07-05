/**
 * config.js — Site Configuration
 * Doctor Portfolio Website — Тетернік О.О.
 *
 * ⚠️  ВАЖЛИВО: Вставте ваші дані Supabase нижче!
 * Щоб знайти ці дані: Supabase Dashboard → Settings → API
 */

const SITE_CONFIG = {
  // ──────────────────────────────────────────────
  //  SUPABASE — Підключення до бази даних
  // ──────────────────────────────────────────────
  supabase: {
    // Ваш Project URL (Settings → API → Project URL)
    url: 'https://YOUR_PROJECT_ID.supabase.co',

    // Ваш anon/public ключ (Settings → API → Project API Keys → anon public)
    anonKey: 'YOUR_ANON_KEY_HERE',

    // Назва таблиці з записами на прийом
    appointmentsTable: 'appointments',

    // Колонка з датою (якщо потрібно фільтрувати від певної дати)
    dateColumn: 'created_at',

    // Дата початку підрахунку (лютий 2026)
    countFrom: '2026-02-01',
  },

  // ──────────────────────────────────────────────
  //  СТАТИСТИКА — Дані для секції «Цифри довіри»
  // ──────────────────────────────────────────────
  stats: {
    experience: 45,           // Років досвіду
    certificates: null,       // Сертифікатів (null = заховати блок поки немає даних)
    patientsFromSupabase: true,  // true = брати з Supabase | false = використати staticCount
    patientsStaticCount: 1200,   // Запасне значення якщо Supabase недоступний
    patientsSince: 'лютого 2026',     // Текст підпису
    patientsSinceEn: 'February 2026', // English
  },

  // ──────────────────────────────────────────────
  //  TELEGRAM BOT — Посилання для запису
  // ──────────────────────────────────────────────
  telegram: {
    botLink: 'https://t.me/YOUR_BOT_USERNAME', // Замініть на реальне посилання
  },
};
