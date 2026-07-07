/**
 * env.example.js — Шаблон для env.js (ЦЕЙ файл комітується в Git)
 *
 * Щоб налаштувати проєкт локально:
 *   1. Скопіюйте цей файл: скопіюйте як js/env.js
 *   2. Замініть значення нижче реальними ключами
 *   3. Збережіть — реальний env.js НЕ потрапить на GitHub
 *
 * Де знайти дані Supabase:
 *   → https://supabase.com/dashboard → ваш проєкт → Settings → API
 */

window.ENV = {
  SUPABASE_URL:      'https://YOUR_PROJECT_ID.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_ANON_KEY_HERE',
  BOT_URL:           'https://YOUR_BOT_URL.onrender.com', // (or http://localhost:8000 for local test)
  BOT_SECRET:        'barboss_secret_webhook_barsik_426752',
};
