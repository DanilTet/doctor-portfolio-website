/**
 * Main JavaScript — Navigation, Scroll Effects, Language Switcher
 * Doctor Portfolio Website — Тетернік О.О.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initBurgerMenu();
  initSmoothScroll();
  initLanguageSwitcher();
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
