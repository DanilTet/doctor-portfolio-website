/**
 * sync-analytics.js
 * Downloads all daily_analytics rows from Supabase REST API
 * and saves them locally into server/data/analytics.json
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Credentials from env or defaults
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kbnbcgdqpncchgeflooz.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_PWw8qGP62U5s_HlMWxZVYQ_v731-yWy';

const DATA_DIR = path.join(__dirname, 'data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

async function downloadAnalytics() {
  console.log('🔄 Скачивание статистики из Supabase...');
  console.log(`📌 URL: ${SUPABASE_URL}`);

  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });

    const endpoint = `${SUPABASE_URL}/rest/v1/daily_analytics?select=*&order=date.desc&limit=1000`;
    const response = await fetch(endpoint, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Supabase HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    console.log(`✅ Успешно выкачано записей: ${data.length}`);

    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`💾 Данные сохранены в: ${ANALYTICS_FILE}`);
  } catch (err) {
    console.error('❌ Ошибка скачивания статистики:', err.message);
    process.exit(1);
  }
}

downloadAnalytics();
