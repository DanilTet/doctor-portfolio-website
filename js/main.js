/**
 * Main JavaScript — Navigation, Scroll Effects, Language Switcher
 * Doctor Portfolio Website — Тетернік О.О.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initBurgerMenu();
  initSmoothScroll();
  initLanguageSwitcher();
  initServiceModal();
  initAppointmentModal();
});


/* ============================================================
   HEADER — Scroll Effect (glassmorphism on scroll)
   ============================================================ */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const SCROLL_THRESHOLD = 50;

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // check initial state
}


/* ============================================================
   BURGER MENU — Mobile Navigation Toggle
   ============================================================ */
function initBurgerMenu() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav__link');

  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    nav.classList.toggle('nav--open');
    document.body.style.overflow = nav.classList.contains('nav--open') ? 'hidden' : '';
  });

  // Close nav when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      nav.classList.remove('nav--open');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
      burger.classList.remove('active');
      nav.classList.remove('nav--open');
      document.body.style.overflow = '';
    }
  });
}


/* ============================================================
   SMOOTH SCROLL — Navigate to sections
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      const headerHeight = document.getElementById('header')?.offsetHeight || 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}


/* ============================================================
   LANGUAGE SWITCHER — UA / EN
   ============================================================ */
const translations = {
  ua: {
    // Navigation
    'nav.about': 'Про лікаря',
    'nav.services': 'Послуги',
    'nav.diplomas': 'Дипломи',
    'nav.reviews': 'Відгуки',
    'nav.contacts': 'Контакти',
    'nav.appointment': 'Записатися на прийом',

    // Hero
    'hero.badge': 'Лікар вищої категорії',
    'hero.name.first': 'Тетернік',
    'hero.name.last': 'Олег Олександрович',
    'hero.specialization': 'Лікар-ендоскопіст вищої категорії з 42-річним досвідом. Діагностична та лікувальна ендоскопія — індивідуальний підхід до кожного пацієнта.',
    'hero.experience.number': '42',
    'hero.experience.label': 'Років профес\u0456йного\nдосв\u0456ду в медицин\u0456',
    'hero.btn.appointment': 'Записатися на прийом',
    'hero.btn.more': 'Дізнатися більше',
    'hero.float.value': '5000+',
    'hero.float.label': 'Задоволених пацієнтів',
    'hero.scroll': 'Гортайте вниз',

    // Stats
    'stats.exp.label': 'Років досвіду',
    'stats.exp.sub': 'в ендоскопії та медицині',
    'stats.patients.label': 'Прийомів з Telegram-боту',
    'stats.patients.sub': 'з лютого 2026 року',
    'stats.patients.live': 'Live',
    'stats.spec.number': 'Ендоскопіст',
    'stats.spec.label': 'Спеціалізація',
    'stats.spec.sub': 'діагностична та лікувальна ендоскопія',

    // Sections
    'section.stats': 'Цифри довіри',
    'section.about': 'Про лікаря',
    'section.services': 'Послуги',
    'section.diplomas': 'Дипломи та сертифікати',
    'section.reviews': 'Відгуки пацієнтів',
    'section.contacts': 'Контакти',

    // About
    'about.subtitle': 'Знайомство з лікарем',
    'about.title': 'Тетернік Олег Олександрович',
    'about.role': 'Лікар Хірург Ендоскопіст',
    'about.bio.1': 'Професіонал з 42-річним досвідом у проведенні високоточних ендоскопічних та хірургічних втручань. Основний пріоритет — максимальна безпека, безболісність та комфорт пацієнта під час кожної процедури.',
    'about.bio.2': 'Завдяки сучасному обладнанню та індивідуальному підходу, ми забезпечуємо точну діагностику та ефективне лікування захворювань шлунково-кишкового тракту.',
    'about.spec.1': 'Гастроскопія',
    'about.spec.2': 'Колоноскопія',
    'about.spec.3': 'ЕРХПГ',
    'about.spec.4': 'Бронхоскопія',
    'about.spec.5': 'УЗД',
    'about.spec.6': 'Хірургія',
    'about.card.location.label': 'Місце прийому',
    'about.card.location.value': '17 лікарня, м.Харків, пр.Героїв Харкова 195',
    'about.card.phone.label': 'Телефон',
    'about.btn': 'Записатися через Telegram',

    // Services
    'services.subtitle': 'Напрямки та дослідження',
    'services.title': 'Медичні послуги',
    'services.card.btn': 'Детальніше про процедуру',
    'services.modal.close': 'Закрити',
    'services.modal.appointment': 'Записатися на прийом',
    'services.modal.steps_title': 'Покроковий перебіг процедури',

    // Appointment Modal
    'appointment.modal.title': 'Запис на прийом',
    'appointment.modal.subtitle': 'Заповніть форму на сайті або скористайтесь Telegram-ботом',
    'appointment.form.name.label': 'Ваше ім\'я (ПІБ)',
    'appointment.form.name.placeholder': 'Іванов Іван Іванович',
    'appointment.form.phone.label': 'Номер телефону',
    'appointment.form.phone.placeholder': '+380XXXXXXXXX',
    'appointment.form.service.label': 'Оберіть послугу',
    'appointment.form.comment.label': 'Короткий коментар / симптоми (опціонально)',
    'appointment.form.comment.placeholder': 'Опишіть, що вас турбує або бажаний час...',
    'appointment.form.submit': 'Надіслати заявку',
    'appointment.divider': 'або залиште заявку у Telegram',
    'appointment.tg.btn': 'Записатися через Telegram-бот',
    'appointment.success.title': 'Дякуємо! Заявку прийнято',
    'appointment.success.desc': 'Ми зателефонуємо вам найближчим часом для підтвердження часу прийому.',
    'appointment.success.btn': 'Зрозуміло',

    // Footer
    'footer.copy': '© 2026 Тетернік О.О. Усі права захищені.',
  },
  en: {
    // Navigation
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.diplomas': 'Diplomas',
    'nav.reviews': 'Reviews',
    'nav.contacts': 'Contacts',
    'nav.appointment': 'Book Appointment',

    // Hero
    'hero.badge': 'Highest Category Physician',
    'hero.name.first': 'Teternick',
    'hero.name.last': 'Oleg Oleksandrovych',
    'hero.specialization': 'Senior endoscopist with 42 years of professional experience. Diagnostic and therapeutic endoscopy — individual approach to each patient.',
    'hero.experience.number': '42',
    'hero.experience.label': 'Years of professional\nexperience in medicine',
    'hero.btn.appointment': 'Book Appointment',
    'hero.btn.more': 'Learn More',
    'hero.float.value': '5000+',
    'hero.float.label': 'Satisfied patients',
    'hero.scroll': 'Scroll down',

    // Stats
    'stats.exp.label': 'Years of Experience',
    'stats.exp.sub': 'in endoscopy & medicine',
    'stats.patients.label': 'Appointments via Telegram',
    'stats.patients.sub': 'since February 2026',
    'stats.patients.live': 'Live',
    'stats.spec.number': 'Endoscopist',
    'stats.spec.label': 'Specialization',
    'stats.spec.sub': 'diagnostic & therapeutic endoscopy',

    // Sections
    'section.stats': 'Trust in Numbers',
    'section.about': 'About the Doctor',
    'section.services': 'Services',
    'section.diplomas': 'Diplomas & Certificates',
    'section.reviews': 'Patient Reviews',
    'section.contacts': 'Contacts',

    // About
    'about.subtitle': 'Meet the Doctor',
    'about.title': 'Teternick Oleg Oleksandrovych',
    'about.role': 'Surgeon Endoscopist',
    'about.bio.1': 'A professional with 42 years of experience in performing highly precise endoscopic and surgical interventions. The main priority is maximum safety, painlessness, and patient comfort during every procedure.',
    'about.bio.2': 'Thanks to modern equipment and an individual approach, we provide accurate diagnostics and effective treatment of gastrointestinal tract diseases.',
    'about.spec.1': 'Gastroscopy',
    'about.spec.2': 'Colonoscopy',
    'about.spec.3': 'ERCP',
    'about.spec.4': 'Bronchoscopy',
    'about.spec.5': 'Ultrasound',
    'about.spec.6': 'Surgery',
    'about.card.location.label': 'Location',
    'about.card.location.value': '17th Hospital, Kharkiv, Heroiv Kharkova Ave 195',
    'about.card.phone.label': 'Phone',
    'about.btn': 'Book via Telegram',

    // Services
    'services.subtitle': 'Fields & Diagnostics',
    'services.title': 'Medical Services',
    'services.card.btn': 'Learn More About Procedure',
    'services.modal.close': 'Close',
    'services.modal.appointment': 'Book Appointment',
    'services.modal.steps_title': 'Step-by-Step Procedure Process',

    // Appointment Modal
    'appointment.modal.title': 'Book an Appointment',
    'appointment.modal.subtitle': 'Fill out the form below or use our Telegram Bot',
    'appointment.form.name.label': 'Your Full Name',
    'appointment.form.name.placeholder': 'John Doe',
    'appointment.form.phone.label': 'Phone Number',
    'appointment.form.phone.placeholder': '+380XXXXXXXXX',
    'appointment.form.service.label': 'Select Service',
    'appointment.form.comment.label': 'Short comment / symptoms (optional)',
    'appointment.form.comment.placeholder': 'Describe your symptoms or preferred time...',
    'appointment.form.submit': 'Submit Appointment Request',
    'appointment.divider': 'or book instantly via Telegram',
    'appointment.tg.btn': 'Book via Telegram Bot',
    'appointment.success.title': 'Thank You! Request Received',
    'appointment.success.desc': 'We will call you shortly to confirm your appointment time.',
    'appointment.success.btn': 'Got it',

    // Footer
    'footer.copy': '© 2026 Teternick O.O. All rights reserved.',
  }
};

let currentLang = 'ua';

function initLanguageSwitcher() {
  const langButtons = document.querySelectorAll('.lang-switch__btn');

  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang === currentLang) return;

      currentLang = lang;

      // Update active button
      langButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update html lang attribute
      document.documentElement.lang = lang === 'ua' ? 'uk' : 'en';

      // Apply translations
      applyTranslations(lang);
    });
  });
}

function applyTranslations(lang) {
  const t = translations[lang];
  if (!t) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) {
      // Preserve HTML inside the element (e.g., icons within buttons)
      const childNodes = el.querySelectorAll('svg, img, .hero__badge-dot');
      if (childNodes.length > 0) {
        // Find the text node and update it
        const textContent = t[key];
        // Re-render with children preserved
        const fragment = document.createDocumentFragment();
        childNodes.forEach(child => fragment.appendChild(child.cloneNode(true)));
        el.textContent = textContent;
        // Prepend children back
        if (fragment.childNodes.length > 0) {
          el.prepend(fragment);
        }
      } else {
        el.textContent = t[key];
      }
    }
  });
}

/* ============================================================
   SERVICES MODAL DATA & CONTROLLER
   ============================================================ */
const SERVICES_DATA = {
  gastroscopy: {
    title: { ua: 'Гастроскопія (ВГДС)', en: 'Gastroscopy (EGD)' },
    subtitle: { ua: 'Ендоскопічне дослідження стравоходу, шлунка та 12-палої кишки', en: 'Endoscopic examination of esophagus, stomach and duodenum' },
    desc: {
      ua: 'Високоточний метод діагностики, що дозволяє детально оглянути слизову оболонку верхніх відділів шлунково-кишкового тракту, виявити запалення, виразки, поліпи або інші зміни на ранніх стадіях.',
      en: 'A high-precision diagnostic method for inspecting the upper GI mucosa, detecting inflammation, ulcers, polyps, or early-stage changes.'
    },
    steps: [
      {
        title: { ua: '1. Підготовка', en: '1. Preparation' },
        text: { ua: 'Дослідження проводиться суворо натщесерце (не їсти за 6-8 годин до прийому, не пити за 2-3 години). Напередодні рекомендується легка вечеря.', en: 'Performed strictly on an empty stomach (no food for 6-8 hours, no liquids for 2-3 hours before). Light dinner the evening before.' }
      },
      {
        title: { ua: '2. Як проходить процедура', en: '2. Procedure Steps' },
        text: { ua: 'Пацієнт лягає на лівий бік. Тонкий гнучкий ендоскоп з відеокамерою високої роздільної здатності обережно вводиться через ротову порожнину. Обстеження триває всього 5–10 хвилин.', en: 'Patient lies on the left side. A thin flexible video endoscope is gently inserted through the mouth. The exam takes only 5–10 minutes.' }
      },
      {
        title: { ua: '3. Безболісність та анестезія', en: '3. Comfort & Sedation' },
        text: { ua: 'Використовується місцева спрей-анестезія горла (лідокаїн). За бажанням пацієнта або за медичними показаннями процедуру можна провести «уві сні» (медикаментозний сон / седація) під наглядом анестезіолога.', en: 'Local throat spray (lidocaine) is used. At the patient\'s request, sedation ("sleep endoscopy") can be administered under an anesthesiologist\'s care.' }
      }
    ]
  },
  colonoscopy: {
    title: { ua: 'Колоноскопія (КС)', en: 'Colonoscopy' },
    subtitle: { ua: 'Повна ендоскопічна діагностика товстого кишечника', en: 'Full endoscopic diagnostic of the colon' },
    desc: {
      ua: 'Найбільш інформативний метод діагностики захворювань товстої кишки, що дозволяє не лише виявити патології на ранніх стадіях, а й одночасно провести видалення поліпів або взяти біопсію.',
      en: 'The gold standard for diagnosing colon conditions, enabling early detection and immediate polyp removal or biopsy.'
    },
    steps: [
      {
        title: { ua: '1. Підготовка', en: '1. Preparation' },
        text: { ua: 'Потребує безшлакової дієти протягом 2-3 днів та прийому спеціального препарату для очищення кишечника напередодні за призначенням лікаря.', en: 'Requires a low-fiber diet for 2-3 days and a specific bowel preparation solution taken the day before as prescribed.' }
      },
      {
        title: { ua: '2. Як проходить процедура', en: '2. Procedure Steps' },
        text: { ua: 'Дослідження виконується гнучким колоноскопом з оглядом слизової по всій довжині товстого кишечника. Тривалість процедури — близько 15–25 хвилин.', en: 'Examined using a flexible colonoscope assessing mucosa across the entire colon. Duration is approx. 15–25 minutes.' }
      },
      {
        title: { ua: '3. Безболісність та анестезія', en: '3. Comfort & Sedation' },
        text: { ua: 'Для максимального комфорту рекомендується медикаментозний сон (седація), під час якого пацієнт не відчуває ніякого дискомфорту та болю.', en: 'For optimal comfort, intravenous sedation is recommended so the patient feels no pain or anxiety during the study.' }
      }
    ]
  },
  ercp: {
    title: { ua: 'ЕРХПГ', en: 'ERCP Procedure' },
    subtitle: { ua: 'Діагностика та малоінвазивне лікування жовчних протоків', en: 'Diagnostics & minimally invasive treatment of bile ducts' },
    desc: {
      ua: 'Спеціалізоване високотехнологічне втручання, що поєднує ендоскопію та рентгеноскопію для діагностики та видалення каменів із жовчних протоків або відновлення їх прохідності.',
      en: 'Advanced intervention combining endoscopy and fluoroscopy to diagnose and clear bile duct stones or restore patency.'
    },
    steps: [
      {
        title: { ua: '1. Підготовка', en: '1. Preparation' },
        text: { ua: 'Обов\'язкова попередня консультація, аналізи крові та інструментальне обстеження (УЗД/КТ). Строго натщесерце.', en: 'Requires pre-procedure blood work, ultrasound/CT review, and strict fasting.' }
      },
      {
        title: { ua: '2. Як проходить процедура', en: '2. Procedure Steps' },
        text: { ua: 'Спеціальний дуоденоскоп вводиться у 12-палу кишку до великого дуоденального сосочка, через який вводиться контраст та виконуються необхідні маніпуляції.', en: 'A specialized duodenoscope is passed to the papilla of Vater, contrast is injected, and therapeutic steps are performed.' }
      },
      {
        title: { ua: '3. Безболісність та анестезія', en: '3. Comfort & Sedation' },
        text: { ua: 'Проводиться виключно під загальним знеболенням або глибокою седацією у стаціонарних умовах.', en: 'Performed exclusively under general anesthesia or deep sedation in a hospital room.' }
      }
    ]
  },
  bronchoscopy: {
    title: { ua: 'Бронхоскопія', en: 'Bronchoscopy' },
    subtitle: { ua: 'Огляд та діагностика дихальних шляхів і бронхіального дерева', en: 'Inspection & diagnostics of airways and bronchial tree' },
    desc: {
      ua: 'Метод прямого візуального обстеження трахеї та бронхів за допомогою ультратонкого гнучкого бронхоскопа для оцінки стану дихальної системи та забору матеріалу.',
      en: 'Direct visualization of the trachea and bronchi using an ultra-thin flexible scope for respiratory assessment and sampling.'
    },
    steps: [
      {
        title: { ua: '1. Підготовка', en: '1. Preparation' },
        text: { ua: 'Виконується натщесерце (не їсти та не пити зранку). Необхідно попередити лікаря про наявність алергій або астми.', en: 'Done fasting (no food or drinks in the morning). Inform the doctor of any allergies or asthma history.' }
      },
      {
        title: { ua: '2. Як проходить процедура', en: '2. Procedure Steps' },
        text: { ua: 'Бронхоскоп через ніс або рот м\'яко проводиться у дихальні шляхи. Процедура займає 5–15 хвилин.', en: 'The bronchoscope is gently passed via nose or mouth into the airways. Lasts 5–15 minutes.' }
      },
      {
        title: { ua: '3. Безболісність та анестезія', en: '3. Comfort & Sedation' },
        text: { ua: 'Застосовується якісна місцева анестезія слизових носоглотки та трахеї, що усуває кашльовий рефлекс.', en: 'Local anesthetic spray is applied to the airway mucosa to block the cough reflex effectively.' }
      }
    ]
  },
  ultrasound: {
    title: { ua: 'УЗД діагностика', en: 'Ultrasound Diagnostics' },
    subtitle: { ua: 'Ультразвукове дослідження органів черевної порожнини', en: 'Ultrasound study of abdominal organs' },
    desc: {
      ua: 'Безпечний, безболісний та швидкий метод обстеження печінки, жовчного міхура, підшлункової залози, селезінки та нирок у реальному часі.',
      en: 'Safe, non-invasive real-time imaging of liver, gallbladder, pancreas, spleen, and kidneys.'
    },
    steps: [
      {
        title: { ua: '1. Підготовка', en: '1. Preparation' },
        text: { ua: 'Бажано проводити натщесерце або через 6 годин після прийому їжі. За день утриматися від продуктів, що викликають газоутворення.', en: 'Best performed on an empty stomach (or 6 hours after meals). Avoid gas-inducing foods the day before.' }
      },
      {
        title: { ua: '2. Як проходить процедура', en: '2. Procedure Steps' },
        text: { ua: 'Пацієнт розташовується на кушетці, лікар наносить гіпоалергенний гель на шкіру та сканує органи датчиком. Займає 15–20 хвилин.', en: 'Patient lies on a couch, hypoallergenic gel is applied, and organs are scanned. Takes 15–20 minutes.' }
      },
      {
        title: { ua: '3. Безболісність та анестезія', en: '3. Comfort & Sedation' },
        text: { ua: 'Процедура абсолютно безболісна, не має протипоказань та не потребує анестезії.', en: 'Completely painless, safe for all ages, requires no anesthesia.' }
      }
    ]
  },
  surgery: {
    title: { ua: 'Оперативна ендоскопія та хірургія', en: 'Operative Endoscopy & Surgery' },
    subtitle: { ua: 'Малоінвазивні втручання та ендоскопічна хірургія', en: 'Minimally invasive interventions and endoscopic surgery' },
    desc: {
      ua: 'Видалення поліпів шлунка та кишечника (поліпектомія), зупинка кровотеч, забір біопсії, видалення чужорідних тіл без розрізів та тривалої реабілітації.',
      en: 'Polyp removal (polypectomy), hemostasis, biopsies, foreign body retrieval without surgical cuts.'
    },
    steps: [
      {
        title: { ua: '1. Підготовка', en: '1. Preparation' },
        text: { ua: 'Визначається індивідуально залежно від обсягу втручання після попереднього діагностичного обстеження.', en: 'Determined individually based on procedure scope following initial diagnostic assessment.' }
      },
      {
        title: { ua: '2. Як проходить процедура', en: '2. Procedure Steps' },
        text: { ua: 'Виконується за допомогою спеціальних інструментів, що проводяться через канал ендоскопа безпосередньо до осередку ураження.', en: 'Executed using surgical accessories guided through the endoscope channel directly to the target area.' }
      },
      {
        title: { ua: '3. Безболісність та анестезія', en: '3. Comfort & Sedation' },
        text: { ua: 'Забезпечується повний анальгетичний захист або комбінована анестезія для максимальної безпеки.', en: 'Full pain management or general sedation is provided for complete safety and tranquility.' }
      }
    ]
  }
};

let activeModalServiceKey = null;

function initServiceModal() {
  const modal = document.getElementById('service-modal');
  if (!modal) return;

  const closeBtns = modal.querySelectorAll('[data-modal-close]');
  const modalTitle = document.getElementById('modal-service-title');
  const modalSubtitle = document.getElementById('modal-service-subtitle');
  const modalDesc = document.getElementById('modal-service-desc');
  const modalStepsContainer = document.getElementById('modal-service-steps');

  // Open modal triggers
  document.querySelectorAll('[data-service-key]').forEach(card => {
    card.addEventListener('click', (e) => {
      const key = card.dataset.serviceKey;
      openModal(key);
    });
  });

  function openModal(key) {
    const data = SERVICES_DATA[key];
    if (!data) return;

    activeModalServiceKey = key;
    renderModalContent(data);

    modal.classList.add('modal--active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('modal--active');
    document.body.style.overflow = '';
    activeModalServiceKey = null;
  }

  function renderModalContent(data) {
    const lang = currentLang;
    if (modalTitle) modalTitle.textContent = data.title[lang] || data.title.ua;
    if (modalSubtitle) modalSubtitle.textContent = data.subtitle[lang] || data.subtitle.ua;
    if (modalDesc) modalDesc.textContent = data.desc[lang] || data.desc.ua;

    if (modalStepsContainer) {
      modalStepsContainer.innerHTML = data.steps.map(step => `
        <div class="modal-step">
          <h4 class="modal-step__title">${step.title[lang] || step.title.ua}</h4>
          <p class="modal-step__text">${step.text[lang] || step.text.ua}</p>
        </div>
      `).join('');
    }
  }

  // Event listeners for close
  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal__overlay')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('modal--active')) {
      closeModal();
    }
  });

  // Re-render open modal on language switch
  window.addEventListener('languageChanged', (e) => {
    if (activeModalServiceKey && SERVICES_DATA[activeModalServiceKey]) {
      renderModalContent(SERVICES_DATA[activeModalServiceKey]);
    }
  });
}


/* ============================================================
   APPOINTMENT BOOKING MODAL & FORM CONTROLLER
   ============================================================ */
function initAppointmentModal() {
  const modal = document.getElementById('appointment-modal');
  if (!modal) return;

  const form = document.getElementById('appointment-form');
  const phoneInput = document.getElementById('app-phone');
  const serviceSelect = document.getElementById('app-service');
  const closeBtns = modal.querySelectorAll('[data-modal-close]');
  const formState = document.getElementById('appointment-form-state');
  const successState = document.getElementById('appointment-success-state');

  // Open triggers
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-appointment], .btn-appointment, a[href="#appointment"]');
    if (trigger) {
      e.preventDefault();

      const preselectedService = trigger.dataset.serviceName || trigger.getAttribute('data-service');
      if (preselectedService && serviceSelect) {
        serviceSelect.value = preselectedService;
      }

      openModal();
    }
  });

  function openModal() {
    modal.classList.add('modal--active');
    document.body.style.overflow = 'hidden';
    resetForm();
  }

  function closeModal() {
    modal.classList.remove('modal--active');
    document.body.style.overflow = '';
  }

  function resetForm() {
    if (form) form.reset();
    if (phoneInput) phoneInput.value = '+380';
    if (formState) formState.style.display = 'block';
    if (successState) successState.style.display = 'none';
  }

  // Auto phone mask +380...
  if (phoneInput) {
    phoneInput.addEventListener('focus', () => {
      if (!phoneInput.value || phoneInput.value === '') {
        phoneInput.value = '+380';
      }
    });

    phoneInput.addEventListener('input', () => {
      let val = phoneInput.value;
      if (!val.startsWith('+380')) {
        val = '+380' + val.replace(/^\+?3?8?0?/, '');
      }
      const prefix = '+380';
      const rest = val.slice(4).replace(/\D/g, '').slice(0, 9);
      phoneInput.value = prefix + rest;
    });
  }

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('app-name');
      const commentInput = document.getElementById('app-comment');
      const submitBtn = form.querySelector('button[type="submit"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const service = serviceSelect ? serviceSelect.value : '';
      const comment = commentInput ? commentInput.value.trim() : '';

      if (!name || name.length < 2) {
        alert(currentLang === 'ua' ? 'Будь ласка, вкажіть ваше ім\'я' : 'Please enter your name');
        return;
      }

      if (!phone || phone.length < 13) {
        alert(currentLang === 'ua' ? 'Будь ласка, введіть коректний номер телефону (+380XXXXXXXXX)' : 'Please enter a valid phone number (+380XXXXXXXXX)');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = currentLang === 'ua' ? 'Надсилання...' : 'Sending...';
      }

      const success = await submitAppointment({ name, phone, service, comment });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText || (currentLang === 'ua' ? 'Надіслати заявку' : 'Submit Appointment Request');
      }

      if (success) {
        if (formState) formState.style.display = 'none';
        if (successState) successState.style.display = 'block';
      }
    });
  }

  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal__overlay')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('modal--active')) {
      closeModal();
    }
  });
}


