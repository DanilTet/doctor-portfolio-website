import os

def generate_html(lang, title, meta_desc, h1, subtitle, toc, content, uk_url, ru_url):
    lang_btn_uk = f'<a href="{uk_url}" class="lang-switch__btn {"active" if lang == "uk" else ""}">UA</a>'
    lang_btn_ru = f'<a href="{ru_url}" class="lang-switch__btn {"active" if lang == "ru" else ""}">RU</a>'
    
    back_text = "Назад на головну" if lang == "uk" else "Назад на главную"
    btn_text = "Записатися на прийом" if lang == "uk" else "Записаться на прием"
    tg_btn_text = "Записатися через Telegram-бот" if lang == "uk" else "Записаться через Telegram-бот"
    form_btn_text = "Заповнити форму на сайті" if lang == "uk" else "Заполнить форму на сайте"
    footer_text = "© 2026 Тетернік О.О. Всі права захищені." if lang == "uk" else "© 2026 Тетерник О.А. Все права защищены."
    toc_title = "Путівник по статті:" if lang == "uk" else "Путеводитель по статье:"

    toc_html = f"""
    <div style="background: rgba(43, 217, 185, 0.05); border-left: 4px solid var(--color-primary); padding: 24px; border-radius: 0 8px 8px 0; margin-bottom: 40px;">
        <h4 style="margin-top: 0; margin-bottom: 16px; color: var(--color-primary); font-size: 1.2rem;">{toc_title}</h4>
        <ol style="margin: 0; padding-left: 20px; line-height: 1.8; list-style-type: decimal;">
            {toc}
        </ol>
    </div>
    """

    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{meta_desc}">
  <meta name="author" content="Тетернік О.О.">

  <!-- Open Graph -->
  <meta property="og:title" content="{title} | Лікар Тетернік О.О.">
  <meta property="og:description" content="{meta_desc}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="{"uk_UA" if lang == "uk" else "ru_RU"}">
  
  <title>{title} | Лікар Тетернік О.О.</title>
  <link rel="icon" href="/favicon.png" type="image/png">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="stylesheet" href="/css/animations.css">
  <link rel="stylesheet" href="/css/blog.css">
  
  <style>
    html {{ scroll-behavior: smooth; }}
    .article-content h2, .article-content h3 {{ scroll-margin-top: 100px; }}
    .toc-link {{ color: var(--color-text); text-decoration: none; transition: color 0.3s; }}
    .toc-link:hover {{ color: var(--color-primary); }}
  </style>
</head>
<body>

  <header class="header" id="header">
    <div class="container header__inner">
      <a href="/" class="header__logo" aria-label="На головну">
        <span class="header__logo-text"><span>Ендоскопія</span> <span>простими словами</span></span>
      </a>
      <nav class="nav" id="nav" aria-label="Головне меню">
        <div class="header__actions" style="margin-left: auto;">
          <div class="lang-switch">
            {lang_btn_uk}
            {lang_btn_ru}
          </div>
          <a href="/#appointment-section" class="btn btn--primary header__cta open-booking-modal">{btn_text}</a>
        </div>
      </nav>
    </div>
  </header>

  <section class="section" style="padding-top: 140px; padding-bottom: 60px; background: radial-gradient(120% 120% at 50% 10%, #151a26 0%, #0a0d14 100%);">
    <div class="container">
      <a href="/" class="btn btn--ghost" style="margin-bottom: 24px; display: inline-flex; align-items: center; gap: 8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        <span>{back_text}</span>
      </a>
      <h1 class="section-title" style="text-align: left; margin-bottom: 16px; font-size: clamp(2rem, 5vw, 3.5rem);">{h1}</h1>
      <p class="section-subtitle" style="text-align: left; max-width: 800px;">{subtitle}</p>
    </div>
  </section>

  <section class="section" style="padding: 60px 0;">
    <div class="container">
      <div class="card article-content" style="max-width: 800px; margin: 0 auto; line-height: 1.8;">
        
        {toc_html}
        
        {content}
        
        <div style="margin-top: 40px; text-align: center;">
          <a href="/#appointment-section" class="btn btn--primary open-booking-modal">{btn_text}</a>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer__inner">
      <p class="footer__copy">{footer_text}</p>
    </div>
  </footer>

  <div class="modal" id="appointment-modal" aria-hidden="true" role="dialog">
    <div class="modal__overlay" data-modal-close></div>
    <div class="modal__window modal__window--form" style="max-width: 480px;">
      <button class="modal__close" data-modal-close aria-label="Close modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="modal__header" style="text-align: center; margin-bottom: 24px;">
        <h3 class="modal__title">{btn_text}</h3>
      </div>

      <div class="modal__body" style="display: flex; flex-direction: column; gap: 16px;">
        <a href="https://t.me/AppointmentEndoscopyBot" class="btn btn--primary" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          <span>{tg_btn_text}</span>
        </a>
        <a href="/#appointment-section" class="btn btn--outline" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>{form_btn_text}</span>
        </a>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {{
      const header = document.getElementById('header');
      function checkScroll() {{
        if (window.scrollY > 20) {{
          header.classList.add('header--scrolled');
        }} else {{
          header.classList.remove('header--scrolled');
        }}
      }}
      window.addEventListener('scroll', checkScroll);
      checkScroll();

      const modal = document.getElementById('appointment-modal');
      const openBtns = document.querySelectorAll('.open-booking-modal');
      const closeBtns = document.querySelectorAll('[data-modal-close]');

      openBtns.forEach(btn => {{
        btn.addEventListener('click', (e) => {{
          e.preventDefault();
          modal.classList.add('modal--active');
          modal.setAttribute('aria-hidden', 'false');
        }});
      }});

      closeBtns.forEach(btn => {{
        btn.addEventListener('click', () => {{
          modal.classList.remove('modal--active');
          modal.setAttribute('aria-hidden', 'true');
        }});
      }});
    }});
  </script>

  <!-- Analytics Tracking -->
  <script src="/js/env.js"></script>
  <script src="/js/config.js"></script>
  <script src="/js/tracker.js"></script>
</body>
</html>"""


base_dir = "c:/oleg-site/doctor-portfolio-website"


pages = [
    {
        "id": "pechiya",
        "uk": {
            "title": "Печія — це не норма!",
            "meta_desc": "Чому печія може бути небезпечною і коли час робити гастроскопію. Симптоми, на які варто звернути увагу. Стравохід Барретта та запалення.",
            "h1": "🌶 Печія — це не норма!",
            "subtitle": "Звичайна печія чи прихована небезпека? Розбираємось, коли варто бити на сполох та записуватись до лікаря.",
            "toc": """
                <li><a href="#section-1" class="toc-link">Що таке печія насправді і як вона виникає?</a></li>
                <li><a href="#section-2" class="toc-link">Чим небезпечна регулярна печія? (Стравохід Барретта)</a></li>
                <li><a href="#section-3" class="toc-link">Коли пігулки "від печії" роблять тільки гірше?</a></li>
                <li><a href="#section-4" class="toc-link">5 симптомів, коли гастроскопія життєво необхідна</a></li>
                <li><a href="#section-5" class="toc-link">Чому не варто боятися обстеження: гастроскопія уві сні</a></li>
            """,
            "content": """
            <h3 id="section-1" style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Що таке печія насправді і як вона виникає?</h3>
            <p style="margin-bottom: 16px;">Кожна людина хоч раз у житті відчувала неприємне печіння за грудиною після переїдання або гострої їжі. Цей стан називається <strong>печією</strong>. Механізм її виникнення досить простий: між стравоходом та шлунком знаходиться спеціальний м'язовий клапан (сфінктер). У нормі він щільно закритий і пропускає їжу лише в одному напрямку — зверху вниз. Але якщо цей клапан слабшає, агресивний шлунковий сік (який містить соляну кислоту) закидається назад у стравохід. Оскільки слизова стравоходу не має захисту від кислоти, виникає хімічний опік, який ми відчуваємо як печіння.</p>
            <p style="margin-bottom: 16px;">Поодинокі напади печії — це нормально. Але якщо вона стає вашим постійним супутником — це серйозний сигнал від організму, що сфінктер перестав працювати належним чином.</p>
            
            <h3 id="section-2" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Чим небезпечна регулярна печія? (Стравохід Барретта)</h3>
            <p style="margin-bottom: 16px;">Багато хто роками живе з печією, "гасячи" її пігулками або содою. Але чи знали ви, що постійна кислотна атака призводить до хронічного запалення стравоходу — <strong>рефлюкс-езофагіту</strong>?</p>
            <p style="margin-bottom: 16px;">Якщо цей стан не лікувати роками, клітини слизової стравоходу починають мутувати, намагаючись захиститися від кислоти. Цей передраковий стан у медицині називається <strong>стравоходом Барретта</strong>. Він протікає безсимптомно, але збільшує ризик розвитку раку стравоходу в десятки разів! Виявити ці зміни може <em>тільки</em> лікар-ендоскопіст під час гастроскопії за допомогою сучасних ендоскопів із високою роздільною здатністю та NBI-режимами.</p>
            
            <h3 id="section-3" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Коли пігулки "від печії" роблять тільки гірше?</h3>
            <p style="margin-bottom: 16px;">Антациди (препарати, що нейтралізують кислоту) чудово знімають симптом тут і зараз. Але вони не лікують причину — слабкий клапан. Більше того, якщо приймати їх безконтрольно роками, вони можуть маскувати серйозні проблеми (наприклад, утворення виразки). Поки ви радієте відсутності симптомів після пігулки, руйнування слизової може продовжуватися.</p>
            
            <h3 id="section-4" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">5 симптомів, коли гастроскопія життєво необхідна</h3>
            <p style="margin-bottom: 16px;">Вам обов'язково потрібно записатися на обстеження, якщо ви спостерігаєте у себе наступні ознаки (так звані "червоні прапорці"):</p>
            <ul style="margin: 0 0 24px 0; padding-left: 20px; list-style-type: disc;">
                <li style="margin-bottom: 10px;"><strong>Частота:</strong> Печія турбує вас частіше 2-3 разів на тиждень незалежно від їжі.</li>
                <li style="margin-bottom: 10px;"><strong>Слабкий ефект ліків:</strong> Пігулки перестали допомагати або дають лише короткочасний ефект на кілька годин.</li>
                <li style="margin-bottom: 10px;"><strong>Дискомфорт при ковтанні:</strong> З'явився біль при ковтанні твердої їжі або відчуття "кома в горлі" (дисфагія). Це дуже тривожний симптом.</li>
                <li style="margin-bottom: 10px;"><strong>Додаткові симптоми:</strong> Є хронічний кашель, захриплість голосу зранку або кислий присмак у роті.</li>
                <li style="margin-bottom: 10px;"><strong>Втрата ваги:</strong> Спостерігається нудота, блювання після їжі або незрозуміла втрата ваги.</li>
            </ul>

            <h3 id="section-5" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Чому не варто боятися обстеження: гастроскопія уві сні</h3>
            <p style="margin-bottom: 16px;">Гастроскопія (ВГДС) — це єдиний надійний спосіб побачити реальну картину зсередини, оцінити ступінь пошкодження стравоходу, перевірити шлунок на наявність бактерії Helicobacter pylori та підібрати правильне, сучасне лікування.</p>
            <p style="margin-bottom: 16px;">Я знаю, що багато хто відкладає візит до лікаря саме через страх перед процедурою ("ковтанням кишки"). Проте сучасна ендоскопія кардинально відрізняється від того, що було раніше. У нашій клініці процедура проводиться ультратонкими зондами. А для тих, хто взагалі не хоче відчувати дискомфорту, ми пропонуємо <strong>гастроскопію у стані медикаментозного сну (седації)</strong>.</p>
            <p style="margin-bottom: 16px;">Ви просто лягаєте, анестезіолог вводить безпечний снодійний препарат короткої дії, ви м'яко засинаєте. За 10 хвилин ви прокидаєтесь у комфортній палаті — а процедура вже завершена! Жодного болю, страху, блювотних позивів чи неприємних спогадів. Тільки точний діагноз та чіткий план лікування.</p>
            """
        },
        "ru": {
            "title": "Изжога — это не норма!",
            "meta_desc": "Почему изжога может быть опасной и когда пора делать гастроскопию. Симптомы, на которые стоит обратить внимание. Пищевод Барретта.",
            "h1": "🌶 Изжога — это не норма!",
            "subtitle": "Обычная изжога или скрытая опасность? Разбираемся, когда стоит бить тревогу и записываться к врачу.",
            "toc": """
                <li><a href="#section-1" class="toc-link">Что такое изжога на самом деле и как она возникает?</a></li>
                <li><a href="#section-2" class="toc-link">Чем опасна регулярная изжога? (Пищевод Барретта)</a></li>
                <li><a href="#section-3" class="toc-link">Когда таблетки "от изжоги" делают только хуже?</a></li>
                <li><a href="#section-4" class="toc-link">5 симптомов, когда гастроскопия жизненно необходима</a></li>
                <li><a href="#section-5" class="toc-link">Почему не стоит бояться обследования: гастроскопия во сне</a></li>
            """,
            "content": """
            <h3 id="section-1" style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Что такое изжога на самом деле и как она возникает?</h3>
            <p style="margin-bottom: 16px;">Каждый человек хоть раз в жизни испытывал неприятное жжение за грудиной после переедания или острой пищи. Этот процесс называется <strong>изжогой</strong>. Механизм ее возникновения прост: между пищеводом и желудком находится специальный мышечный клапан (сфинктер). В норме он плотно закрыт и пропускает пищу только в одном направлении — сверху вниз. Но если этот клапан ослабевает, агрессивный желудочный сок (содержащий соляную кислоту) забрасывается обратно в пищевод. Так как слизистая пищевода не имеет защиты от кислоты, возникает химический ожог, который мы ощущаем как жжение.</p>
            <p style="margin-bottom: 16px;">Единичные приступы изжоги — это нормально. Но если она становится вашим постоянным спутником — это серьезный сигнал от организма, что сфинктер перестал работать как положено.</p>
            
            <h3 id="section-2" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Чем опасна регулярная изжога? (Пищевод Барретта)</h3>
            <p style="margin-bottom: 16px;">Многие годами живут с изжогой, "гася" ее таблетками или содой. Но знали ли вы, что постоянная кислотная атака приводит к хроническому воспалению пищевода — <strong>рефлюкс-эзофагиту</strong>?</p>
            <p style="margin-bottom: 16px;">Если это состояние не лечить годами, клетки слизистой пищевода начинают мутировать, пытаясь защититься от кислоты. Это предраковое состояние в медицине называется <strong>пищеводом Барретта</strong>. Оно протекает бессимптомно, но увеличивает риск развития рака пищевода в десятки раз! Выявить эти изменения может <em>только</em> врач-эндоскопист во время гастроскопии с помощью современных эндоскопов с высоким разрешением и NBI-режимами.</p>
            
            <h3 id="section-3" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Когда таблетки "от изжоги" делают только хуже?</h3>
            <p style="margin-bottom: 16px;">Антациды (препараты, нейтрализующие кислоту) отлично снимают симптом здесь и сейчас. Но они не лечат причину — слабый клапан. Более того, если принимать их бесконтрольно годами, они могут маскировать серьезные проблемы (например, образование язвы). Пока вы радуетесь отсутствию симптомов после таблетки, разрушение слизистой может продолжаться.</p>
            
            <h3 id="section-4" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">5 симптомов, когда гастроскопия жизненно необходима</h3>
            <p style="margin-bottom: 16px;">Вам обязательно нужно записаться на обследование, если вы наблюдаете у себя следующие признаки (так называемые "красные флажки"):</p>
            <ul style="margin: 0 0 24px 0; padding-left: 20px; list-style-type: disc;">
                <li style="margin-bottom: 10px;"><strong>Частота:</strong> Изжога беспокоит вас чаще 2-3 раз в неделю независимо от еды.</li>
                <li style="margin-bottom: 10px;"><strong>Слабый эффект лекарств:</strong> Таблетки перестали помогать или дают лишь кратковременный эффект на пару часов.</li>
                <li style="margin-bottom: 10px;"><strong>Дискомфорт при глотании:</strong> Появилась боль при проглатывании твердой пищи или ощущение "кома в горле" (дисфагия). Это очень тревожный симптом.</li>
                <li style="margin-bottom: 10px;"><strong>Дополнительные симптомы:</strong> Присутствует хронический кашель, охриплость голоса по утрам или кислый привкус во рту.</li>
                <li style="margin-bottom: 10px;"><strong>Потеря веса:</strong> Наблюдается тошнота, рвота после еды или необъяснимая потеря веса.</li>
            </ul>

            <h3 id="section-5" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Почему не стоит бояться обследования: гастроскопия во сне</h3>
            <p style="margin-bottom: 16px;">Гастроскопия (ВГДС) — это единственный надежный способ увидеть реальную картину изнутри, оценить степень повреждения пищевода, проверить желудок на наличие бактерии Helicobacter pylori и подобрать правильное лечение.</p>
            <p style="margin-bottom: 16px;">Я знаю, что многие откладывают визит к врачу именно из-за страха перед процедурой ("глотания кишки"). Однако современная эндоскопия кардинально отличается от того, что было раньше. В нашей клинике процедура проводится ультратонкими зондами. А для тех, кто вообще не хочет испытывать дискомфорта, мы предлагаем <strong>гастроскопию в состоянии медикаментозного сна (седации)</strong>.</p>
            <p style="margin-bottom: 16px;">Вы просто ложитесь, анестезиолог вводит безопасный снотворный препарат короткого действия, вы мягко засыпаете. Через 10 минут вы просыпаетесь в комфортной палате — а процедура уже завершена! Никакой боли, страха, рвотных позывов или неприятных воспоминаний. Только точный диагноз и четкий план лечения.</p>
            """
        }
    },
    {
        "id": "age-colonoscopy",
        "uk": {
            "title": "Колоноскопія в 25-30 років",
            "meta_desc": "Чому колоноскопію іноді призначають у молодому віці. Симптоми, при яких обстеження необхідне незалежно від віку.",
            "h1": "🤷‍♂️ Мені лише 25, навіщо колоноскопія?",
            "subtitle": "Міфи про вік та обстеження кишківника. Коли процедура життєво необхідна.",
            "toc": """
                <li><a href="#section-1" class="toc-link">Міф: Колоноскопія тільки для літніх людей</a></li>
                <li><a href="#section-2" class="toc-link">Симптоми, які не можна ігнорувати (Червоні прапорці)</a></li>
                <li><a href="#section-3" class="toc-link">Генетика та сімейний анамнез</a></li>
                <li><a href="#section-4" class="toc-link">Як поліп може стати раком за кілька років</a></li>
                <li><a href="#section-5" class="toc-link">Як проходить процедура уві сні?</a></li>
            """,
            "content": """
            <h3 id="section-1" style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Міф: Колоноскопія тільки для літніх людей</h3>
            <p style="margin-bottom: 16px;">У суспільстві міцно вкоренився міф, що обстеження кишківника потрібне лише людям після 50 років. Дійсно, профілактичний скринінг за міжнародними протоколами стартує з 45 років. Але ця цифра стосується виключно людей, яких <strong>взагалі нічого не турбує</strong>.</p>
            <p style="margin-bottom: 16px;">Сучасна статистика невблаганна: онкологічні захворювання кишківника, запальні хвороби (виразковий коліт, хвороба Крона) стрімко "молодшають". Сьогодні ми все частіше знаходимо передракові поліпи у пацієнтів 25-35 років. Спосіб життя, харчування, стреси — все це впливає на здоров'я ШКТ.</p>
            
            <h3 id="section-2" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Симптоми, які не можна ігнорувати (Червоні прапорці)</h3>
            <p style="margin-bottom: 16px;">Незалежно від того, чи вам 20, чи 60 років, існує перелік симптомів, поява яких є прямим показанням до негайної колоноскопії:</p>
            <ul style="margin: 0 0 24px 0; padding-left: 20px; list-style-type: disc;">
                <li style="margin-bottom: 10px;"><strong>Кров у калі:</strong> Будь-які домішки крові (яскраво-червоної або темної), слизу або гною. Навіть якщо ви впевнені, що це "просто геморой", це має підтвердити лікар після огляду всієї товстої кишки.</li>
                <li style="margin-bottom: 10px;"><strong>Порушення випорожнень:</strong> Хронічні діареї (проноси) або стійкі закрепи, що тривають тижнями без видимої причини, або їх раптове чергування.</li>
                <li style="margin-bottom: 10px;"><strong>Болі:</strong> Постійні або переймоподібні болі в животі, сильне здуття, метеоризм.</li>
                <li style="margin-bottom: 10px;"><strong>Загальний стан:</strong> Безпричинна слабкість, швидка втомлюваність, незрозуміла втрата ваги.</li>
                <li style="margin-bottom: 10px;"><strong>Аналізи:</strong> Зниження рівня гемоглобіну (анемія) або позитивний тест на приховану кров у калі.</li>
            </ul>

            <h3 id="section-3" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Генетика та сімейний анамнез</h3>
            <p style="margin-bottom: 16px;">Окремо варто сказати про генетику. Якщо у ваших прямих родичів (батьки, брати, сестри) був діагностований рак товстої кишки або виявлені множинні поліпи, вам необхідно почати обстеження набагато раніше. Золоте правило: першу колоноскопію потрібно зробити <strong>на 10 років раніше</strong> від віку, в якому був виявлений рак у вашого родича (наприклад, якщо у батька виявили в 45, вам потрібно пройти скринінг у 35).</p>

            <h3 id="section-4" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Як поліп може стати раком за кілька років</h3>
            <p style="margin-bottom: 16px;">Рак товстої кишки — один з найпоширеніших у світі. Але його унікальність полягає в тому, що він розвивається дуже повільно. Майже 95% випадків раку починаються з невеликого доброякісного утворення — поліпа. Процес переродження поліпа в злоякісну пухлину займає від 5 до 10 років.</p>
            <p style="margin-bottom: 16px;">Колоноскопія дає нам можливість розірвати цей ланцюг. Під час процедури ми не просто дивимось на поліп — ми одразу його видаляємо (це абсолютно безболісно, бо слизова кишківника не має больових рецепторів). Таким чином, видаливши поліп сьогодні, ми буквально рятуємо людину від раку в майбутньому.</p>

            <h3 id="section-5" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Як проходить процедура уві сні?</h3>
            <p style="margin-bottom: 16px;">Головна причина, чому молоді люди відкладають колоноскопію до останнього — це страх болю та сором. Але сучасна медицина вже давно вирішила цю проблему. 95% таких обстежень у цивілізованому світі проводяться <strong>під седацією (медикаментозний сон)</strong>.</p>
            <p style="margin-bottom: 16px;">Процес виглядає так: ви приходите в клініку, переодягаєтесь у спеціальні одноразові шорти, лягаєте на кушетку. Анестезіолог вводить вам у вену препарат. Ви засинаєте природним сном. Лікар ретельно, сантиметр за сантиметром оглядає кишківник за допомогою гнучкого відеоендоскопа. Якщо є поліпи — видаляє їх. Вся процедура триває 20-30 хвилин. Потім ви прокидаєтесь — і все вже позаду. Жодного болю, дискомфорту чи збентеження.</p>
            """
        },
        "ru": {
            "title": "Колоноскопия в 25-30 лет",
            "meta_desc": "Почему колоноскопию иногда назначают в молодом возрасте. Симптомы, при которых обследование необходимо независимо от возраста.",
            "h1": "🤷‍♂️ Мне всего 25, зачем колоноскопия?",
            "subtitle": "Мифы о возрасте и обследовании кишечника. Когда процедура жизненно необходима.",
            "toc": """
                <li><a href="#section-1" class="toc-link">Миф: Колоноскопия только для пожилых людей</a></li>
                <li><a href="#section-2" class="toc-link">Симптомы, которые нельзя игнорировать (Красные флажки)</a></li>
                <li><a href="#section-3" class="toc-link">Генетика и семейный анамнез</a></li>
                <li><a href="#section-4" class="toc-link">Как полип может стать раком за несколько лет</a></li>
                <li><a href="#section-5" class="toc-link">Как проходит процедура во сне?</a></li>
            """,
            "content": """
            <h3 id="section-1" style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Миф: Колоноскопия только для пожилых людей</h3>
            <p style="margin-bottom: 16px;">В обществе прочно укоренился миф, что обследование кишечника нужно только людям после 50 лет. Действительно, профилактический скрининг по международным протоколам стартует с 45 лет. Но эта цифра касается исключительно тех, кого <strong>вообще ничего не беспокоит</strong>.</p>
            <p style="margin-bottom: 16px;">Современная статистика неумолима: онкологические заболевания кишечника, воспалительные болезни (язвенный колит, болезнь Крона) стремительно "молодеют". Сегодня мы все чаще находим предраковые полипы у пациентов 25-35 лет. Образ жизни, питание, стрессы — все это влияет на здоровье ЖКТ.</p>
            
            <h3 id="section-2" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Симптомы, которые нельзя игнорировать (Красные флажки)</h3>
            <p style="margin-bottom: 16px;">Независимо от того, 20 вам лет или 60, существует перечень симптомов, появление которых является прямым показанием к немедленной колоноскопии:</p>
            <ul style="margin: 0 0 24px 0; padding-left: 20px; list-style-type: disc;">
                <li style="margin-bottom: 10px;"><strong>Кровь в стуле:</strong> Любые примеси крови (алой или темной), слизи или гноя. Даже если вы уверены, что это "просто геморрой", это должен подтвердить врач после осмотра всей толстой кишки.</li>
                <li style="margin-bottom: 10px;"><strong>Нарушение стула:</strong> Хронические диареи (поносы) или стойкие запоры, длящиеся неделями без видимой причины.</li>
                <li style="margin-bottom: 10px;"><strong>Боли:</strong> Постоянные или схваткообразные боли в животе, сильное вздутие, метеоризм.</li>
                <li style="margin-bottom: 10px;"><strong>Общее состояние:</strong> Беспричинная слабость, быстрая утомляемость, необъяснимая потеря веса.</li>
                <li style="margin-bottom: 10px;"><strong>Анализы:</strong> Снижение уровня гемоглобина (анемия) или положительный тест на скрытую кровь в кале.</li>
            </ul>

            <h3 id="section-3" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Генетика и семейный анамнез</h3>
            <p style="margin-bottom: 16px;">Отдельно стоит сказать о генетике. Если у ваших прямых родственников (родители, братья, сестры) был диагностирован рак толстой кишки или множественные полипы, вам необходимо начать обследование гораздо раньше. Золотое правило: первую колоноскопию нужно сделать <strong>на 10 лет раньше</strong> возраста, в котором был выявлен рак у вашего родственника (например, если у отца обнаружили в 45, вам нужно пройти скрининг в 35).</p>

            <h3 id="section-4" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Как полип может стать раком за несколько лет</h3>
            <p style="margin-bottom: 16px;">Рак толстой кишки — один из самых распространенных в мире. Но его уникальность заключается в том, что он развивается очень медленно. Почти 95% случаев рака начинаются с небольшого доброкачественного образования — полипа. Процесс перерождения полипа в злокачественную опухоль занимает от 5 до 10 лет.</p>
            <p style="margin-bottom: 16px;">Колоноскопия дает нам возможность разорвать эту цепь. Во время процедуры мы не просто смотрим на полип — мы сразу его удаляем (это абсолютно безболезненно, так как слизистая кишечника не имеет болевых рецепторов). Таким образом, удалив полип сегодня, мы буквально спасаем человека от рака в будущем.</p>

            <h3 id="section-5" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Как проходит процедура во сне?</h3>
            <p style="margin-bottom: 16px;">Главная причина, почему молодые люди откладывают колоноскопию до последнего — это страх боли и стеснение. Но современная медицина уже давно решила эту проблему. 95% таких обследований в цивилизованном мире проводятся <strong>под седацией (медикаментозный сон)</strong>.</p>
            <p style="margin-bottom: 16px;">Процесс выглядит так: вы приходите в клинику, переодеваетесь в специальные одноразовые шорты, ложитесь на кушетку. Анестезиолог вводит вам в вену препарат. Вы засыпаете естественным сном. Врач тщательно, сантиметр за сантиметром осматривает кишечник с помощью гибкого видеоэндоскопа. Если есть полипы — удаляет их. Вся процедура длится 20-30 минут. Затем вы просыпаетесь — и всё уже позади. Никакой боли, дискомфорта или стеснения.</p>
            """
        }
    },
    {
        "id": "food-uzd",
        "uk": {
            "title": "Їжа перед УЗД черевної порожнини",
            "meta_desc": "Чому не можна їсти перед УЗД і як сніданок може зіпсувати результати обстеження. Правила підготовки до УЗД.",
            "h1": "🍔 З'їв бутерброд перед УЗД: що буде?",
            "subtitle": "«Я тільки кави випив!» — як ми псуємо своє УЗД і чому підготовка визначає точність діагнозу.",
            "toc": """
                <li><a href="#section-1" class="toc-link">Як працює ультразвук і чому йому заважає їжа?</a></li>
                <li><a href="#section-2" class="toc-link">Що бачить лікар, якщо ви перекусили перед УЗД?</a></li>
                <li><a href="#section-3" class="toc-link">Золоті правила підготовки: що МОЖНА і що НЕ МОЖНА їсти</a></li>
                <li><a href="#section-4" class="toc-link">Що робити з ліками та водою?</a></li>
                <li><a href="#section-5" class="toc-link">Коли підготовка не потрібна? (Екстрені випадки)</a></li>
            """,
            "content": """
            <h3 id="section-1" style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Як працює ультразвук і чому йому заважає їжа?</h3>
            <p style="margin-bottom: 16px;">Ультразвукова діагностика базується на здатності звукових хвиль відбиватися від органів нашого тіла. Чим щільніший орган, тим краще він відбиває хвилі, і тим чіткіше зображення бачить лікар на моніторі. Але є один головний ворог ультразвуку — це <strong>повітря та гази</strong>.</p>
            <p style="margin-bottom: 16px;">Для звукових хвиль скупчення газів у кишківнику працює як бетонна стіна. Ультразвук просто не може пройти крізь неї. Саме тому головна мета підготовки до УЗД черевної порожнини — максимально зменшити кількість газів у шлунково-кишковому тракті та привести органи в їх "спокійний" стан.</p>
            
            <h3 id="section-2" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Що бачить лікар, якщо ви перекусили перед УЗД?</h3>
            <p style="margin-bottom: 16px;">Часто пацієнти кажуть: «Я з'їв тільки одне маленьке печиво» або «Я випив лише каву з молоком, це ж вода!». Насправді, для вашого шлунка та жовчного міхура не має значення розмір порції. Навіть найменший шматочок їжі чи ковток солодкого напою запускає повноцінний процес травлення.</p>
            <p style="margin-bottom: 16px;">Що при цьому відбувається всередині:</p>
            <ul style="margin: 0 0 24px 0; padding-left: 20px; list-style-type: disc;">
                <li style="margin-bottom: 10px;"><strong>Жовчний міхур скорочується:</strong> Його головна функція — зберігати жовч і викидати її для перетравлення їжі. Як тільки ви поїли, міхур скорочується, викидає жовч і стає схожим на спущену повітряну кульку. Лікар не зможе роздивитися його стінки, не побачить поліпи чи дрібні камені. Доведеться приходити ще раз.</li>
                <li style="margin-bottom: 10px;"><strong>Підшлункова залоза активізується:</strong> Вона починає виділяти ферменти, до неї приливає кров, що ускладнює точну оцінку її розмірів та структури.</li>
                <li style="margin-bottom: 10px;"><strong>Утворюються гази:</strong> Запускається перистальтика (рух) кишківника, утворюється багато газів, які перекривають огляд підшлункової залози та печінки. Замість органів лікар бачить на екрані "білий шум".</li>
            </ul>

            <h3 id="section-3" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Золоті правила підготовки: що МОЖНА і що НЕ МОЖНА їсти</h3>
            <p style="margin-bottom: 16px;">Щоб обстеження було точним і не довелося витрачати час на повторний візит, дотримуйтесь цих правил за 2-3 дні до УЗД:</p>
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h4 style="margin-top: 0; margin-bottom: 10px; color: #ff6b6b;">❌ КАТЕГОРИЧНО ВИКЛЮЧИТИ (викликають сильні гази):</h4>
                <ul style="margin: 0 0 16px 0; padding-left: 20px; list-style-type: disc;">
                    <li style="margin-bottom: 6px;">Свіжі овочі та фрукти (особливо капуста, яблука, виноград).</li>
                    <li style="margin-bottom: 6px;">Бобові (горох, квасоля, сочевиця).</li>
                    <li style="margin-bottom: 6px;">Чорний хліб та свіжа випічка.</li>
                    <li style="margin-bottom: 6px;">Молоко (у тому числі в каві) та жирні молочні продукти.</li>
                    <li style="margin-bottom: 6px;">Газовані напої, квас, алкоголь.</li>
                    <li style="margin-bottom: 6px;">Жувальна гумка (стимулює виділення шлункового соку та заковтування повітря).</li>
                </ul>
                <h4 style="margin-top: 0; margin-bottom: 10px; color: #4CAF50;">✅ МОЖНА ЇСТИ (легка дієта):</h4>
                <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
                    <li style="margin-bottom: 6px;">Відварене нежирне м'ясо (курка, індичка, телятина) або риба.</li>
                    <li style="margin-bottom: 6px;">Каші на воді (вівсянка, гречка, рис).</li>
                    <li style="margin-bottom: 6px;">Твердий нежирний сир.</li>
                    <li style="margin-bottom: 6px;">Запечені яблука.</li>
                </ul>
            </div>

            <h3 id="section-4" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Що робити з ліками та водою?</h3>
            <p style="margin-bottom: 16px;"><strong>Час останнього прийому їжі:</strong> Якщо ваше УЗД призначено на ранок (до 12:00) — приходьте строго <strong>натщесерце</strong>. Не снідайте взагалі. Якщо процедура призначена на другу половину дня (наприклад, 15:00) — ви можете легко поснідати рано вранці (о 7:00-8:00), після чого витримати мінімум 6-8 годин голоду.</p>
            <p style="margin-bottom: 16px;"><strong>Вода:</strong> За 2-3 години до обстеження краще взагалі не пити. Якщо дуже хочеться пити — зробіть 1-2 маленьких ковтки чистої негазованої води. Жодного чаю, кави чи соку!</p>
            <p style="margin-bottom: 16px;"><strong>Медикаменти:</strong> Якщо ви приймаєте життєво важливі препарати (наприклад, від тиску чи серця), ви можете прийняти їх за розкладом, запивши мінімальним ковтком води. Обов'язково попередьте лікаря УЗД про ліки, які ви прийняли.</p>

            <h3 id="section-5" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Коли підготовка не потрібна? (Екстрені випадки)</h3>
            <p style="margin-bottom: 16px;">Усі вищенаведені правила стосуються планових, профілактичних оглядів, коли нам важлива ювелірна точність. Проте, якщо у вас виник гострий нестерпний біль у животі, травма, підозра на напад гострого холециститу, апендициту або внутрішню кровотечу — <strong>УЗД робиться екстрено, без жодної підготовки</strong>. У таких ситуаціях завдання лікаря — швидко врятувати життя, виявивши головну загрозу, і наявність їжі в шлунку не стане на заваді для постановки екстреного діагнозу.</p>
            """
        },
        "ru": {
            "title": "Еда перед УЗИ брюшной полости",
            "meta_desc": "Почему нельзя есть перед УЗИ и как завтрак может испортить результаты обследования. Правила подготовки.",
            "h1": "🍔 Съел бутерброд перед УЗИ: что будет?",
            "subtitle": "«Я только кофе выпил!» — как мы портим свое УЗИ и почему подготовка определяет точность диагноза.",
            "toc": """
                <li><a href="#section-1" class="toc-link">Как работает ультразвук и почему ему мешает еда?</a></li>
                <li><a href="#section-2" class="toc-link">Что видит врач, если вы перекусили перед УЗИ?</a></li>
                <li><a href="#section-3" class="toc-link">Золотые правила подготовки: что МОЖНО и что НЕЛЬЗЯ есть</a></li>
                <li><a href="#section-4" class="toc-link">Что делать с лекарствами и водой?</a></li>
                <li><a href="#section-5" class="toc-link">Когда подготовка не нужна? (Экстренные случаи)</a></li>
            """,
            "content": """
            <h3 id="section-1" style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Как работает ультразвук и почему ему мешает еда?</h3>
            <p style="margin-bottom: 16px;">Ультразвуковая диагностика базируется на способности звуковых волн отражаться от органов нашего тела. Чем плотнее орган, тем лучше он отражает волны, и тем четче картинку видит врач на мониторе. Но есть один главный враг ультразвука — это <strong>воздух и газы</strong>.</p>
            <p style="margin-bottom: 16px;">Для звуковых волн скопление газов в кишечнике работает как бетонная стена. Ультразвук просто не может пройти сквозь нее. Именно поэтому главная цель подготовки к УЗИ брюшной полости — максимально уменьшить количество газов в желудочно-кишечном тракте и привести органы в их "спокойное" состояние.</p>
            
            <h3 id="section-2" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Что видит врач, если вы перекусили перед УЗИ?</h3>
            <p style="margin-bottom: 16px;">Часто пациенты говорят: «Я съел только одно маленькое печенье» или «Я выпил лишь кофе с молоком, это же вода!». На самом деле, для вашего желудка и желчного пузыря не имеет значения размер порции. Даже самый маленький кусочек еды или глоток сладкого напитка запускает полноценный процесс пищеварения.</p>
            <p style="margin-bottom: 16px;">Что при этом происходит внутри:</p>
            <ul style="margin: 0 0 24px 0; padding-left: 20px; list-style-type: disc;">
                <li style="margin-bottom: 10px;"><strong>Желчный пузырь сокращается:</strong> Его главная функция — хранить желчь и выбрасывать ее для переваривания пищи. Как только вы поели, пузырь сокращается, выбрасывает желчь и становится похожим на сдутый воздушный шарик. Врач не сможет рассмотреть его стенки, не увидит полипы или мелкие камни. Придется приходить еще раз.</li>
                <li style="margin-bottom: 10px;"><strong>Поджелудочная железа активизируется:</strong> Она начинает выделять ферменты, к ней приливает кровь, что сильно затрудняет точную оценку ее размеров и структуры.</li>
                <li style="margin-bottom: 10px;"><strong>Образуются газы:</strong> Запускается перистальтика (движение) кишечника, образуется много газов, которые перекрывают обзор поджелудочной железы и печени. Вместо органов врач видит на экране "белый шум".</li>
            </ul>

            <h3 id="section-3" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Золотые правила подготовки: что МОЖНО и что НЕЛЬЗЯ есть</h3>
            <p style="margin-bottom: 16px;">Чтобы обследование было точным и не пришлось тратить время на повторный визит, соблюдайте эти правила за 2-3 дня до УЗИ:</p>
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h4 style="margin-top: 0; margin-bottom: 10px; color: #ff6b6b;">❌ КАТЕГОРИЧНО ИСКЛЮЧИТЬ (вызывают сильные газы):</h4>
                <ul style="margin: 0 0 16px 0; padding-left: 20px; list-style-type: disc;">
                    <li style="margin-bottom: 6px;">Свежие овощи и фрукты (особенно капуста, яблоки, виноград).</li>
                    <li style="margin-bottom: 6px;">Бобовые (горох, фасоль, чечевица).</li>
                    <li style="margin-bottom: 6px;">Черный хлеб и свежая выпечка.</li>
                    <li style="margin-bottom: 6px;">Молоко (в том числе в кофе) и жирные молочные продукты.</li>
                    <li style="margin-bottom: 6px;">Газированные напитки, квас, алкоголь.</li>
                    <li style="margin-bottom: 6px;">Жевательная резинка (стимулирует выделение желудочного сока и заглатывание воздуха).</li>
                </ul>
                <h4 style="margin-top: 0; margin-bottom: 10px; color: #4CAF50;">✅ МОЖНО ЕСТЬ (легкая диета):</h4>
                <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
                    <li style="margin-bottom: 6px;">Отварное нежирное мясо (курица, индейка, телятина) или рыба.</li>
                    <li style="margin-bottom: 6px;">Каши на воде (овсянка, гречка, рис).</li>
                    <li style="margin-bottom: 6px;">Твердый нежирный сыр.</li>
                    <li style="margin-bottom: 6px;">Запеченные яблоки.</li>
                </ul>
            </div>

            <h3 id="section-4" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Что делать с лекарствами и водой?</h3>
            <p style="margin-bottom: 16px;"><strong>Время последнего приема пищи:</strong> Если ваше УЗИ назначено на утро (до 12:00) — приходите строго <strong>натощак</strong>. Не завтракайте вообще. Если процедура назначена на вторую половину дня (например, 15:00) — вы можете легко позавтракать рано утром (в 7:00-8:00), после чего выдержать минимум 6-8 часов голода.</p>
            <p style="margin-bottom: 16px;"><strong>Вода:</strong> За 2-3 часа до обследования лучше вообще не пить. Если очень хочется пить — сделайте 1-2 маленьких глотка чистой негазированной воды. Никакого чая, кофе или сока!</p>
            <p style="margin-bottom: 16px;"><strong>Медикаменты:</strong> Если вы принимаете жизненно важные препараты (например, от давления или сердца), вы можете принять их по расписанию, запив минимальным глотком воды. Обязательно предупредите врача УЗИ о лекарствах, которые вы приняли.</p>

            <h3 id="section-5" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Когда подготовка не нужна? (Экстренные случаи)</h3>
            <p style="margin-bottom: 16px;">Все вышеприведенные правила касаются плановых, профилактических осмотров, когда нам важна ювелирная точность. Однако, если у вас возникла острая невыносимая боль в животе, травма, подозрение на приступ острого холецистита, аппендицита или внутреннее кровотечение — <strong>УЗИ делается экстренно, без всякой подготовки</strong>. В таких ситуациях задача врача — быстро спасти жизнь, выявив главную угрозу, и наличие пищи в желудке не станет преградой для постановки экстренного диагноза.</p>
            """
        }
    }
]

for p in pages:
    uk_url = f"/articles/{p['id']}"
    ru_url = f"/ru/articles/{p['id']}"
    
    # write UK
    uk_dir = os.path.join(base_dir, "articles", p['id'])
    os.makedirs(uk_dir, exist_ok=True)
    with open(os.path.join(uk_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(generate_html("uk", p["uk"]["title"], p["uk"]["meta_desc"], p["uk"]["h1"], p["uk"]["subtitle"], p["uk"]["toc"], p["uk"]["content"], uk_url, ru_url))
        
    # write RU
    ru_dir = os.path.join(base_dir, "ru", "articles", p['id'])
    os.makedirs(ru_dir, exist_ok=True)
    with open(os.path.join(ru_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(generate_html("ru", p["ru"]["title"], p["ru"]["meta_desc"], p["ru"]["h1"], p["ru"]["subtitle"], p["ru"]["toc"], p["ru"]["content"], uk_url, ru_url))

print("Pages created successfully with TOC and expanded content.")
