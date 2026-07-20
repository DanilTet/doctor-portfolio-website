import os

def generate_html(lang, title, meta_desc, h1, subtitle, content, uk_url, ru_url):
    lang_btn_uk = f'<a href="{uk_url}" class="lang-switch__btn {"active" if lang == "uk" else ""}">UA</a>'
    lang_btn_ru = f'<a href="{ru_url}" class="lang-switch__btn {"active" if lang == "ru" else ""}">RU</a>'
    
    back_text = "Назад на головну" if lang == "uk" else "Назад на главную"
    btn_text = "Записатися на прийом" if lang == "uk" else "Записаться на прием"
    tg_btn_text = "Записатися через Telegram-бот" if lang == "uk" else "Записаться через Telegram-бот"
    form_btn_text = "Заповнити форму на сайті" if lang == "uk" else "Заполнить форму на сайте"
    footer_text = "© 2026 Тетернік О.О. Всі права захищені." if lang == "uk" else "© 2026 Тетерник О.А. Все права защищены."

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
      <div class="card" style="max-width: 800px; margin: 0 auto; line-height: 1.8;">
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
os.makedirs(f"{base_dir}/articles", exist_ok=True)
os.makedirs(f"{base_dir}/ru/articles", exist_ok=True)


pages = [
    {
        "id": "pechiya",
        "uk": {
            "title": "Печія — це не норма!",
            "meta_desc": "Чому печія може бути небезпечною і коли час робити гастроскопію. Симптоми, на які варто звернути увагу.",
            "h1": "🌶 Печія — це не норма!",
            "subtitle": "Звичайна печія чи прихована небезпека? Розбираємось, коли варто бити на сполох.",
            "content": """
            <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Що таке печія насправді?</h3>
            <p style="margin-bottom: 16px;">Багато хто роками живе з печією, "гасячи" її пігулками або содою. Але чи знали ви, що постійна печія може бути симптомом серйозних проблем зі стравоходом та шлунком?</p>
            <p style="margin-bottom: 16px;">Кислота, яка постійно закидається зі шлунка в стравохід, обпікає його слизову. З часом це може призвести до запалення (езофагіту), утворення виразок, або навіть передракових станів (стравохід Барретта).</p>
            
            <h3 style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Коли час йти на гастроскопію?</h3>
            <ul style="margin: 0 0 24px 0; padding-left: 20px; list-style-type: disc;">
                <li style="margin-bottom: 10px;">Печія турбує вас частіше 2-3 разів на тиждень.</li>
                <li style="margin-bottom: 10px;">Пігулки перестали допомагати або дають лише короткочасний ефект.</li>
                <li style="margin-bottom: 10px;">З'явився біль при ковтанні або відчуття "кома в горлі".</li>
                <li style="margin-bottom: 10px;">Є нудота, важкість після їжі або незрозуміла втрата ваги.</li>
            </ul>

            <h3 style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Чому не варто боятися обстеження?</h3>
            <p style="margin-bottom: 16px;">Гастроскопія (ВГДС) — це єдиний спосіб побачити реальну картину зсередини, знайти справжню причину печії та підібрати правильне лікування. Сучасна ендоскопія проводиться тонкими зондами, а за бажанням — <strong>у стані медикаментозного сну (седації)</strong>. Ви просто засинаєте на 10 хвилин і прокидаєтесь вже після завершення процедури, без жодного болю, страху чи дискомфорту.</p>
            """
        },
        "ru": {
            "title": "Изжога — это не норма!",
            "meta_desc": "Почему изжога может быть опасной и когда пора делать гастроскопию. Симптомы, на которые стоит обратить внимание.",
            "h1": "🌶 Изжога — это не норма!",
            "subtitle": "Обычная изжога или скрытая опасность? Разбираемся, когда стоит бить тревогу.",
            "content": """
            <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Что такое изжога на самом деле?</h3>
            <p style="margin-bottom: 16px;">Многие годами живут с изжогой, "гася" ее таблетками или содой. Но знали ли вы, что постоянная изжога может быть симптомом серьезных проблем с пищеводом и желудком?</p>
            <p style="margin-bottom: 16px;">Кислота, которая постоянно забрасывается из желудка в пищевод, обжигает его слизистую. Со временем это может привести к воспалению (эзофагиту), образованию язв, или даже предраковым состояниям (пищевод Барретта).</p>
            
            <h3 style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Когда пора идти на гастроскопию?</h3>
            <ul style="margin: 0 0 24px 0; padding-left: 20px; list-style-type: disc;">
                <li style="margin-bottom: 10px;">Изжога беспокоит вас чаще 2-3 раз в неделю.</li>
                <li style="margin-bottom: 10px;">Таблетки перестали помогать или дают лишь кратковременный эффект.</li>
                <li style="margin-bottom: 10px;">Появилась боль при глотании или ощущение "кома в горле".</li>
                <li style="margin-bottom: 10px;">Есть тошнота, тяжесть после еды или необъяснимая потеря веса.</li>
            </ul>

            <h3 style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Почему не стоит бояться обследования?</h3>
            <p style="margin-bottom: 16px;">Гастроскопия (ВГДС) — это единственный способ увидеть реальную картину изнутри, найти истинную причину изжоги и подобрать правильное лечение. Современная эндоскопия проводится тонкими зондами, а при желании — <strong>в состоянии медикаментозного сна (седации)</strong>. Вы просто засыпаете на 10 минут и просыпаетесь уже после завершения процедуры, без боли, страха или дискомфорта.</p>
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
            "content": """
            <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Захворювання \"молодшають\"</h3>
            <p style="margin-bottom: 16px;">Існує міф, що обстеження кишківника потрібне лише людям після 50 років для профілактики. Проте сучасна статистика невблаганна: багато захворювань, включаючи запальні процеси та навіть новоутворення, зустрічаються все частіше у віці 20-35 років.</p>
            
            <h3 style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Симптоми, які не можна ігнорувати у будь-якому віці:</h3>
            <ul style="margin: 0 0 24px 0; padding-left: 20px; list-style-type: disc;">
                <li style="margin-bottom: 10px;">Домішки крові або слизу в калі.</li>
                <li style="margin-bottom: 10px;">Постійні болі в животі, здуття, порушення травлення.</li>
                <li style="margin-bottom: 10px;">Хронічні діареї або, навпаки, закрепи, що тривають тижнями.</li>
                <li style="margin-bottom: 10px;">Безпричинна слабкість, анемія (низький гемоглобін).</li>
                <li style="margin-bottom: 10px;">Генетична схильність (якщо у родичів були поліпи чи пухлини кишківника).</li>
            </ul>

            <h3 style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Процедура \"уві сні\" — це зовсім не страшно</h3>
            <p style="margin-bottom: 16px;">Головна причина, чому люди відкладають колоноскопію — це страх перед болем. Але сьогодні 95% таких обстежень у світі проводяться <strong>під седацією</strong> (медикаментозний сон).</p>
            <p style="margin-bottom: 16px;">Ви отримуєте препарат, м'яко засинаєте, нічого не відчуваєте під час процедури (яка триває 15-20 хвилин), а після пробудження одразу можете йти додому. Сучасне обладнання та седація роблять цю діагностику абсолютно комфортною.</p>
            """
        },
        "ru": {
            "title": "Колоноскопия в 25-30 лет",
            "meta_desc": "Почему колоноскопию иногда назначают в молодом возрасте. Симптомы, при которых обследование необходимо.",
            "h1": "🤷‍♂️ Мне всего 25, зачем колоноскопия?",
            "subtitle": "Мифы о возрасте и обследовании кишечника. Когда процедура жизненно необходима.",
            "content": """
            <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Заболевания \"молодеют\"</h3>
            <p style="margin-bottom: 16px;">Существует миф, что обследование кишечника нужно только людям после 50 лет для профилактики. Однако современная статистика неумолима: многие заболевания, включая воспалительные процессы и даже новообразования, встречаются все чаще в возрасте 20-35 лет.</p>
            
            <h3 style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Симптомы, которые нельзя игнорировать:</h3>
            <ul style="margin: 0 0 24px 0; padding-left: 20px; list-style-type: disc;">
                <li style="margin-bottom: 10px;">Примеси крови или слизи в стуле.</li>
                <li style="margin-bottom: 10px;">Постоянные боли в животе, вздутие, нарушение пищеварения.</li>
                <li style="margin-bottom: 10px;">Хронические диареи или запоры, длящиеся неделями.</li>
                <li style="margin-bottom: 10px;">Беспричинная слабость, анемия (низкий гемоглобин).</li>
                <li style="margin-bottom: 10px;">Генетическая предрасположенность (у родственников были полипы или опухоли кишечника).</li>
            </ul>

            <h3 style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Процедура \"во сне\" — это совсем не страшно</h3>
            <p style="margin-bottom: 16px;">Главная причина, почему люди откладывают колоноскопию — это страх перед болью. Но сегодня 95% таких обследований в мире проводятся <strong>под седацией</strong> (медикаментозный сон).</p>
            <p style="margin-bottom: 16px;">Вы получаете препарат, мягко засыпаете, ничего не чувствуете во время процедуры (которая длится 15-20 минут), а после пробуждения сразу можете идти домой. Современное оборудование и седация делают эту диагностику абсолютно комфортной.</p>
            """
        }
    },
    {
        "id": "food-uzd",
        "uk": {
            "title": "Їжа перед УЗД черевної порожнини",
            "meta_desc": "Чому не можна їсти перед УЗД і як сніданок може зіпсувати результати обстеження.",
            "h1": "🍔 З'їв бутерброд перед УЗД: що буде?",
            "subtitle": "«Я тільки кави випив!» — як ми псуємо своє УЗД і чому підготовка така важлива.",
            "content": """
            <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Що бачить лікар, якщо ви поїли?</h3>
            <p style="margin-bottom: 16px;">«Я трохи перекусив перед УЗД черевної порожнини, лікарю, нічого страшного?» Насправді, навіть маленьке печиво або ковток кави з молоком запускають процес травлення.</p>
            <p style="margin-bottom: 16px;">Жовчний міхур скорочується, щоб виділити жовч, і стає маленьким — лікар не зможе нормально роздивитися його стінки, поліпи чи камені. Крім того, у кишківнику починають утворюватися гази, які для ультразвуку працюють як непроглядна стіна. Замість чіткої картинки органів лікар побачить \"білий шум\".</p>
            
            <h3 style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Золоті правила підготовки до УЗД живота:</h3>
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
                    <li style="margin-bottom: 10px;"><strong>Натщесерце:</strong> мінімум 6-8 годин без їжі. Якщо УЗД зранку — не снідати. Якщо в обід — легкий сніданок рано вранці.</li>
                    <li style="margin-bottom: 10px;"><strong>Не пити:</strong> за 2 години до обстеження не пити воду, чай чи каву.</li>
                    <li style="margin-bottom: 10px;"><strong>За день до процедури:</strong> виключити продукти, що викликають гази (свіжі овочі та фрукти, бобові, чорний хліб, газовані напої, молоко, солодощі).</li>
                </ul>
            </div>

            <p style="margin-bottom: 16px;">Дотримання цих простих правил гарантує, що обстеження буде максимально точним з першого разу, і вам не доведеться приходити на переробку.</p>
            """
        },
        "ru": {
            "title": "Еда перед УЗИ брюшной полости",
            "meta_desc": "Почему нельзя есть перед УЗИ и как завтрак может испортить результаты обследования.",
            "h1": "🍔 Съел бутерброд перед УЗИ: что будет?",
            "subtitle": "«Я только кофе выпил!» — как мы портим свое УЗИ и почему подготовка так важна.",
            "content": """
            <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Что видит врач, если вы поели?</h3>
            <p style="margin-bottom: 16px;">«Я немного перекусил перед УЗИ брюшной полости, доктор, ничего страшного?» На самом деле, даже маленькое печенье или глоток кофе с молоком запускают процесс пищеварения.</p>
            <p style="margin-bottom: 16px;">Желчный пузырь сокращается, чтобы выделить желчь, и становится маленьким — врач не сможет нормально рассмотреть его стенки, полипы или камни. Кроме того, в кишечнике начинают образовываться газы, которые для ультразвука работают как непроглядная стена. Вместо четкой картинки органов врач увидит "белый шум".</p>
            
            <h3 style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Золотые правила подготовки к УЗИ живота:</h3>
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
                    <li style="margin-bottom: 10px;"><strong>Натощак:</strong> минимум 6-8 часов без еды. Если УЗИ утром — не завтракать. Если в обед — легкий завтрак рано утром.</li>
                    <li style="margin-bottom: 10px;"><strong>Не пить:</strong> за 2 часа до обследования не пить воду, чай или кофе.</li>
                    <li style="margin-bottom: 10px;"><strong>За день до процедуры:</strong> исключить газообразующие продукты (свежие овощи и фрукты, бобовые, черный хлеб, газированные напитки, молоко, сладости).</li>
                </ul>
            </div>

            <p style="margin-bottom: 16px;">Соблюдение этих простых правил гарантирует, что обследование будет максимально точным с первого раза, и вам не придется приходить на переделку.</p>
            """
        }
    }
]

for p in pages:
    uk_url = f"/articles/{p['id']}.html"
    ru_url = f"/ru/articles/{p['id']}.html"
    
    # write UK
    with open(f"{base_dir}/articles/{p['id']}.html", "w", encoding="utf-8") as f:
        f.write(generate_html("uk", p["uk"]["title"], p["uk"]["meta_desc"], p["uk"]["h1"], p["uk"]["subtitle"], p["uk"]["content"], uk_url, ru_url))
        
    # write RU
    with open(f"{base_dir}/ru/articles/{p['id']}.html", "w", encoding="utf-8") as f:
        f.write(generate_html("ru", p["ru"]["title"], p["ru"]["meta_desc"], p["ru"]["h1"], p["ru"]["subtitle"], p["ru"]["content"], uk_url, ru_url))

print("Pages created successfully.")
