# Інструкція з деплою сайту на VPS (Ubuntu 22.04)

Цей посібник допоможе вам розгорнути сайт та адмінку на вашому новому VPS-сервері під керуванням Ubuntu 22.04.

---

## Крок 1. Підключення до сервера через SSH

Після завершення створення сервера хостинг надішле вам на пошту **IP-адресу** сервера та **пароль root**.

Відкрийте термінал (консоль) на своєму комп'ютері та підключіться:
```bash
ssh root@IP_АДРЕСА_ВАШОГО_СЕРВЕРА
```
(Коли термінал запитає пароль — вставте його. Символи пароля при введенні не відображатимуться, це нормально. Натисніть Enter).

---

## Крок 2. Оновлення системи та встановлення Node.js

Виконайте команди у вікні сервера по черзі:

1. Оновіть списки пакетів:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. Встановіть Node.js (версії 20) та менеджер пакетів npm:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Перевірте, чи все встановилося правильно:
   ```bash
   node -v
   npm -v
   ```
   *(Команда має вивести версії програм, наприклад: `v20.x.x` та `10.x.x`).*

---

## Крок 3. Завантаження коду сайту на сервер

Найпростіший спосіб — клонувати ваш репозиторій з GitHub.

1. Перейдіть до папки `/var/www`:
   ```bash
   cd /var/www
   ```

2. Клонуйте ваш проект (замініть на посилання вашого репозиторію):
   ```bash
   git clone https://github.com/DanilTet/doctor-portfolio-website.git
   ```

3. Перейдіть до папки проекту:
   ```bash
   cd doctor-portfolio-website
   ```

---

## Крок 4. Налаштування та запуск Node.js сервера

1. Перейдіть до папки бекенду та встановіть залежності:
   ```bash
   cd server
   npm install
   ```

2. Створіть файл конфігурації `.env`:
   ```bash
   nano .env
   ```
   Вставте туди наступні налаштування (замініть на свої значення):
   ```env
   PORT=3000
   BLOG_SECRET=super-secret-key-123
   INSTAGRAM_BEHOLD_URL=https://feeds.behold.so/ВАШ_FEED_ID
   ```
   *Збережіть файл: натисніть `Ctrl + O`, потім `Enter`, потім вийдіть через `Ctrl + X`.*

3. Для того, щоб сервер працював цілодобово і автоматично перезавантажувався у разі збоїв, встановіть процес-менеджер **PM2**:
   ```bash
   sudo npm install -g pm2
   ```

4. Запустіть сервер через PM2:
   ```bash
   pm2 start server.js --name "doctor-blog"
   ```

5. Налаштуйте автоматичний запуск PM2 при перезавантаженні самого сервера:
   ```bash
   pm2 startup
   ```
   *(Термінал виведе команду, яку потрібно скопіювати та виконати, виконайте її).*
   Після цього збережіть налаштування:
   ```bash
   pm2 save
   ```

---

## Крок 5. Налаштування веб-сервера Nginx та SSL (HTTPS)

Nginx виступатиме як «міст» між інтернетом (порт 80/443) та локальним сервером Node.js (порт 3000).

1. Встановіть Nginx:
   ```bash
   sudo apt install nginx -y
   ```

2. Створіть файл конфігурації для вашого сайту:
   ```bash
   sudo nano /etc/nginx/sites-available/doctor-blog
   ```
   Вставте туди конфігурацію (замініть `yourdomain.com` на ваш реальний домен):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       # Редиректи .html → чисті URL (301 permanent)
       rewrite ^/ru\.html$ /ru permanent;
       rewrite ^/en\.html$ /en permanent;

       # /ru і /en — проксі на Node.js (Express роздає ru.html/en.html за чистим URL)
       location = /ru {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       location = /en {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       # API бекенду
       location /api/ {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Завантажені зображення блогу
       location /uploads/ {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
       }

       # Адмінка
       location /admin {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       # Всі інші запити → статика
       location / {
           root /var/www/doctor-portfolio-website;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```
   *Збережіть файл (`Ctrl + O`, `Enter`, `Ctrl + X`).*

3. Увімкніть конфігурацію та перезапустіть Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/doctor-blog /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Отримання безкоштовного SSL (HTTPS):**
   Встановіть утиліту Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```
   Запустіть отримання сертифіката (замініть на ваш домен):
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
   Дотримуйтесь інструкцій на екрані (введіть свій Email та погодитись на перенаправлення HTTP -> HTTPS).

---

## Крок 6. Конфігурація фронтенду (env.js)

Переконайтеся, що на сервері у папці `/var/www/doctor-portfolio-website/js/env.js` прописані правильні ключі Supabase (аналогічно до вашої локальної копії `js/env.js`), щоб працювали база даних відгуків та розклад.

Вітаємо! Ваш сайт тепер працює у мережі 24/7 із захищеним з'єднанням HTTPS.
