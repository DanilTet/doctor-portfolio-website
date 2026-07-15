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
  initReviewsSection();
  initReviewModal();
  initDiplomas();
  initCertsPagination();
  initTopicsAccordion();
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
    'hero.badge': 'Ендоскопіст, Хірург, УЗД',
    'hero.name.first': 'Тетернік',
    'hero.name.last': 'Олег Олександрович',
    'hero.specialization': 'Лікар-ендоскопіст, хірург, лікар УЗД діагностики з 8-річним досвідом. Спеціалізуюся на ендоскопії, хірургії, УЗД та щороку виконую понад 3000 ендоскопічних досліджень!',
    'hero.experience.number': '8',
    'hero.experience.label': 'Років професійного\nдосвіду в медицині',
    'hero.btn.appointment': 'Записатися на прийом',
    'hero.btn.more': 'Дізнатися більше',
    'hero.float.value': '5000+',
    'hero.float.label': 'Задоволених пацієнтів',
    'hero.scroll': 'Гортайте вниз',

    // Stats
    'stats.exp.label': 'Років досвіду',
    'stats.exp.sub': 'в ендоскопії та медицині',
    'stats.patients.label': 'Процедур в рік',
    'stats.patients.sub': 'понад 3000 досліджень',
    'stats.patients.live': 'Щорічно',
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
    'about.bio.1': 'Професіонал з 8-річним досвідом у проведенні високоточних ендоскопічних та хірургічних втручань. Основний пріоритет — максимальна безпека, безболісність та комфорт пацієнта під час кожної процедури.',
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
    'about.btn': 'Записатися на прийом',

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
    'appointment.divider': 'або заповніть онлайн-форму',
    'appointment.tg.btn': 'Записатися через Telegram-бот',
    'appointment.success.title': 'Дякуємо! Заявку прийнято',
    'appointment.success.desc': 'Ми зателефонуємо вам найближчим часом для підтвердження часу прийому.',
    'appointment.success.btn': 'Зрозуміло',

    // Contacts
    'contacts.subtitle': 'Локація та зв\'язок',
    'contacts.title': 'Контактна інформація',
    'contacts.address.label': 'Місце прийому',
    'contacts.address.value': '17-та міська лікарня, м. Харків, пр. Героїв Харкова 195',
    'contacts.schedule.label': 'Графік прийому',
    'contacts.schedule.value': 'Пн – Сб: 08:00 – 15:00',
    'contacts.schedule.sub': 'Неділя: вихідний',
    'contacts.phone.label': 'Телефон для запису',
    'contacts.instagram.label': 'Офіційний Instagram',
    'contacts.navigation.title': 'Як знайти корпус хірургії?',
    'contacts.navigation.desc': 'Дивіться покрокову відеоінструкцію у збережених Історіях Instagram',
    'contacts.navigation.btn': 'Переглянути маршрут',
    'contacts.map.btn': 'Відкрити в Google Maps',
    'contacts.appointment.btn': 'Записатися на прийом',

    // Reviews
    'reviews.subtitle': 'Довіра та реальний досвід',
    'reviews.title': 'Відгуки пацієнтів',
    'reviews.btn.leave': 'Залишити відгук',
    'reviews.rating.count': 'на основі відгуків пацієнтів',
    'reviews.loading': 'Завантаження відгуків...',
    'reviews.empty': 'Поки що немає опублікованих відгуків. Будьте першим!',
    'reviews.modal.title': 'Ваш відгук про прийом',
    'reviews.modal.subtitle': 'Поділіться вашими враженнями від процедури чи консультації',
    'reviews.modal.name.label': 'Ваше ім\'я (ПІБ)',
    'reviews.modal.name.placeholder': 'Олена Мельник',
    'reviews.modal.stars.label': 'Ваша оцінка',
    'reviews.modal.text.label': 'Текст відгуку',
    'reviews.modal.text.placeholder': 'Напишіть ваші враження від візиту, ставлення лікаря...',
    'reviews.modal.submit': 'Надіслати відгук',
    'reviews.success.title': 'Дякуємо за ваш відгук!',
    'reviews.success.desc': 'Ваш відгук успішно збережено і буде опубліковано після модерації.',

    // Exhibits
    'exhibits.esge.city': 'м. Мілан, Італія',
    'exhibits.esge.title': 'ESGE Days 2026',
    'exhibits.esge.desc': 'Міжнародна ендоскопічна конференція. Обмін досвідом із провідними європейськими фахівцями, обговорення новітніх стандартів та технологій в оперативній ендоскопії.',
    'exhibits.kiev.city': 'м. Київ, Україна',
    'exhibits.kiev.title': 'KievEndo 2023',
    'exhibits.kiev.desc': 'Науково-практична конференція. Презентація клінічних випадків, обговорення сучасних методик малоінвазивної хірургії та діагностичної ендоскопії в Україні.',

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
    'hero.badge': 'Endoscopist, Surgeon, Ultrasound',
    'hero.name.first': 'Teternick',
    'hero.name.last': 'Oleg Oleksandrovych',
    'hero.specialization': 'Endoscopist, surgeon, ultrasound specialist with 8 years of experience. Specializing in endoscopy, surgery, ultrasound, and performing over 3000 endoscopic examinations annually!',
    'hero.experience.number': '8',
    'hero.experience.label': 'Years of professional\nexperience in medicine',
    'hero.btn.appointment': 'Book Appointment',
    'hero.btn.more': 'Learn More',
    'hero.float.value': '5000+',
    'hero.float.label': 'Satisfied patients',
    'hero.scroll': 'Scroll down',

    // Stats
    'stats.exp.label': 'Years of Experience',
    'stats.exp.sub': 'in endoscopy & medicine',
    'stats.patients.label': 'Procedures per year',
    'stats.patients.sub': 'over 3000 examinations',
    'stats.patients.live': 'Annually',
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
    'about.bio.1': 'A professional with 8 years of experience in performing high-precision endoscopic and surgical interventions. The main priority is maximum safety, painlessness, and patient comfort during every procedure.',
    'about.bio.2': 'Thanks to modern equipment and an individual approach, we provide accurate diagnosis and effective treatment of gastrointestinal diseases.',
    'about.spec.1': 'Gastroscopy',
    'about.spec.2': 'Colonoscopy',
    'about.spec.3': 'ERCP',
    'about.spec.4': 'Bronchoscopy',
    'about.spec.5': 'Ultrasound',
    'about.spec.6': 'Surgery',
    'about.card.location.label': 'Location',
    'about.card.location.value': '17th Hospital, Kharkiv, Heroiv Kharkova Ave 195',
    'about.card.phone.label': 'Phone',
    'about.btn': 'Book Appointment',

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
    'appointment.divider': 'or fill out the online form',
    'appointment.tg.btn': 'Book via Telegram Bot',
    'appointment.success.title': 'Thank You! Request Received',
    'appointment.success.desc': 'We will call you shortly to confirm your appointment time.',
    'appointment.success.btn': 'Got it',

    // Contacts
    'contacts.subtitle': 'Location & Contacts',
    'contacts.title': 'Contact Information',
    'contacts.address.label': 'Location',
    'contacts.address.value': '17th City Hospital, Kharkiv, Heroiv Kharkova Ave 195',
    'contacts.schedule.label': 'Working Hours',
    'contacts.schedule.value': 'Mon – Sat: 08:00 – 15:00',
    'contacts.schedule.sub': 'Sunday: Closed',
    'contacts.phone.label': 'Phone Number',
    'contacts.instagram.label': 'Official Instagram',
    'contacts.navigation.title': 'How to find the Surgery Building?',
    'contacts.navigation.desc': 'Watch the step-by-step video guide in Instagram Highlight Stories',
    'contacts.navigation.btn': 'View Route',
    'contacts.map.btn': 'Open in Google Maps',
    'contacts.appointment.btn': 'Book Appointment',

    // Reviews
    'reviews.subtitle': 'Trust & Real Experience',
    'reviews.title': 'Patient Reviews',
    'reviews.btn.leave': 'Leave a Review',
    'reviews.rating.count': 'based on patient ratings',
    'reviews.loading': 'Loading reviews...',
    'reviews.empty': 'No published reviews yet. Be the first to leave one!',
    'reviews.modal.title': 'Your Review of the Visit',
    'reviews.modal.subtitle': 'Share your impressions of the procedure or consultation',
    'reviews.modal.name.label': 'Your Full Name',
    'reviews.modal.name.placeholder': 'Jane Smith',
    'reviews.modal.stars.label': 'Your Rating',
    'reviews.modal.text.label': 'Review Text',
    'reviews.modal.text.placeholder': 'Write your feedback on the visit, doctor\'s attitude...',
    'reviews.modal.submit': 'Submit Review',
    'reviews.success.title': 'Thank You for Your Review!',
    'reviews.success.desc': 'Your review has been saved and will be published after moderation.',

    // Exhibits
    'exhibits.esge.city': 'Milan, Italy',
    'exhibits.esge.title': 'ESGE Days 2026',
    'exhibits.esge.desc': 'International Endoscopic Conference. Exchange of experience with leading European specialists, discussion of the latest standards and technologies in operative endoscopy.',
    'exhibits.kiev.city': 'Kyiv, Ukraine',
    'exhibits.kiev.title': 'KievEndo 2023',
    'exhibits.kiev.desc': 'Scientific and Practical Conference. Presentation of clinical cases, discussion of modern techniques of minimally invasive surgery and diagnostic endoscopy in Ukraine.',

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
    title: { ua: 'Гастроскопія', en: 'Gastroscopy' },
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
    title: { ua: 'Колоноскопія', en: 'Colonoscopy' },
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
    if (formState) formState.style.display = 'flex';
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
        if (successState) successState.style.display = 'flex';
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


/* ============================================================
   REVIEWS SECTION CONTROLLER (Supabase + Pagination)
   ============================================================ */
const FALLBACK_REVIEWS = [
  {
    id: 101,
    user_name: 'Олена Ковальова',
    stars: 5,
    created_at: '2026-02-15T10:00:00Z',
    text: 'Дуже хвилювалася перед гастроскопією, але Олег Олександрович зробив усе надзвичайно чуйно та безболісно! Справжній професіонал з величезним досвідом. Величезне вам дякую!'
  },
  {
    id: 102,
    user_name: 'Михайло Слюсар',
    stars: 5,
    created_at: '2026-02-20T14:30:00Z',
    text: 'Проходив колоноскопію під анестезією. Все пройшло ідеально, заснув і прокинувся без жодного дискомфорту. Лікар все детально пояснив після процедури.'
  },
  {
    id: 103,
    user_name: 'Тетяна Іващенко',
    stars: 5,
    created_at: '2026-03-01T09:15:00Z',
    text: 'Чудовий лікар і людина! Індивідуальний підхід та максимальна увага до пацієнта. Рекомендую Олега Олександровича усім знайомим!'
  },
  {
    id: 104,
    user_name: 'Вадим Гриценко',
    stars: 5,
    created_at: '2026-03-10T11:45:00Z',
    text: 'Високий рівень медичної допомоги. Обстеження пройшло швидко, діагноз встановлено точно. Дякую за вашу працю та чуйність!'
  }
];

let currentReviewPage = 1;
const REVIEWS_PER_PAGE = 6;

async function initReviewsSection() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;

  loadReviewsPage(currentReviewPage);

  const prevBtn = document.getElementById('reviews-prev-page');
  const nextBtn = document.getElementById('reviews-next-page');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentReviewPage > 1) {
        currentReviewPage--;
        loadReviewsPage(currentReviewPage);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentReviewPage++;
      loadReviewsPage(currentReviewPage);
    });
  }
}

async function loadReviewsPage(page = 1) {
  const grid = document.getElementById('reviews-grid');
  const paginationContainer = document.getElementById('reviews-pagination');
  const numbersContainer = document.getElementById('reviews-page-numbers');
  const prevBtn = document.getElementById('reviews-prev-page');
  const nextBtn = document.getElementById('reviews-next-page');

  if (!grid) return;

  // Show spinner loader
  grid.innerHTML = `
    <div class="reviews__loading">
      <div class="spinner"></div>
      <span>${(translations[currentLang] && translations[currentLang]['reviews.loading']) || 'Завантаження відгуків...'}</span>
    </div>
  `;

  let result = null;
  if (typeof fetchReviews === 'function') {
    result = await fetchReviews(page, REVIEWS_PER_PAGE);
  }

  let reviews = [];
  let total = 0;

  if (result && result.reviews && result.reviews.length > 0) {
    reviews = result.reviews;
    total = result.total;
  }

  if (reviews.length === 0) {
    grid.innerHTML = `
      <div class="reviews__loading">
        <p>${(translations[currentLang] && translations[currentLang]['reviews.empty']) || 'Поки що немає відгуків.'}</p>
      </div>
    `;
    if (paginationContainer) paginationContainer.style.display = 'none';
    return;
  }

  // Render review cards (Preserve exact original language text!)
  grid.innerHTML = reviews.map(item => {
    const initial = (item.user_name || 'А')[0].toUpperCase();
    const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('uk-UA') : '';
    const starsCount = Math.min(Math.max(Number(item.stars) || 5, 1), 5);
    const starsHtml = '★'.repeat(starsCount) + '☆'.repeat(5 - starsCount);

    return `
      <div class="review-card">
        <div class="review-card__header">
          <div class="review-card__user">
            <div class="review-card__avatar">${initial}</div>
            <div>
              <div class="review-card__name">${escapeHtml(item.user_name || 'Пацієнт')}</div>
              <div class="review-card__date">${dateStr}</div>
            </div>
          </div>
          <div class="review-card__stars">${starsHtml}</div>
        </div>
        <p class="review-card__text">“${escapeHtml(item.text || '')}”</p>
      </div>
    `;
  }).join('');

  // Handle Pagination
  const totalPages = Math.ceil(total / REVIEWS_PER_PAGE);
  if (totalPages > 1 && paginationContainer) {
    paginationContainer.style.display = 'flex';

    if (prevBtn) prevBtn.disabled = (page <= 1);
    if (nextBtn) nextBtn.disabled = (page >= totalPages);

    if (numbersContainer) {
      numbersContainer.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `pagination__num ${i === page ? 'active' : ''}`;
        btn.textContent = i;
        btn.addEventListener('click', () => {
          currentReviewPage = i;
          loadReviewsPage(currentReviewPage);
        });
        numbersContainer.appendChild(btn);
      }
    }
  } else if (paginationContainer) {
    paginationContainer.style.display = 'none';
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ============================================================
   LEAVE A REVIEW MODAL CONTROLLER
   ============================================================ */
function initReviewModal() {
  const modal = document.getElementById('review-modal');
  const openBtn = document.getElementById('btn-open-review-modal');
  if (!modal) return;

  const form = document.getElementById('review-form');
  const closeBtns = modal.querySelectorAll('[data-modal-close]');
  const formState = document.getElementById('review-form-state');
  const successState = document.getElementById('review-success-state');
  const starBtns = modal.querySelectorAll('.star-btn');
  const starsInput = document.getElementById('review-stars');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      openModal();
    });
  }

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
    setStarRating(5);
    if (formState) formState.style.display = 'flex';
    if (successState) successState.style.display = 'none';
  }

  function setStarRating(val) {
    if (starsInput) starsInput.value = val;
    starBtns.forEach(btn => {
      const bVal = Number(btn.dataset.value);
      if (bVal <= val) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = Number(btn.dataset.value);
      setStarRating(val);
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('review-name');
      const textInput = document.getElementById('review-text');
      const submitBtn = form.querySelector('button[type="submit"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const text = textInput ? textInput.value.trim() : '';
      const stars = starsInput ? Number(starsInput.value) || 5 : 5;

      if (!name || name.length < 2) {
        alert(currentLang === 'ua' ? 'Будь ласка, вкажіть ваші ПІБ' : 'Please enter your name');
        return;
      }

      if (!text || text.length < 5) {
        alert(currentLang === 'ua' ? 'Будь ласка, напишіть текст відгуку' : 'Please enter your review text');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = currentLang === 'ua' ? 'Надсилання...' : 'Submitting...';
      }

      const success = await submitReview({ user_name: name, stars, text });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText || (currentLang === 'ua' ? 'Надіслати відгук' : 'Submit Review');
      }

      if (success) {
        if (formState) formState.style.display = 'none';
        if (successState) successState.style.display = 'flex';
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

/* ============================================================
   CERTIFICATE DATA & TAB CONTROLLER
   ============================================================ */
const CERT_DATA = {
  'cert-esge-days-2026': {
    org: 'ESGE (European Society of Gastrointestinal Endoscopy)',
    title: 'Certificate of Attendance — ESGE Days 2026',
    body: `
      <div class="cert-detail">
        <p><strong>Захід:</strong> ESGE Days 2026 Congress (In-Person)</p>
        <p><strong>Дата:</strong> May 14 - 16, 2026</p>
        <p><strong>Місце:</strong> Milan, Italy</p>
        <p><strong>Учасник:</strong> Dr Oleg Teternik</p>
        <div class="cert-detail__signatures">
          <p><strong>Підписи:</strong> Cesare Hassan (ESGE President)</p>
        </div>
        <div class="cert-detail__img-placeholder">
          <img src="img/certificates/cert-esge-days-2026.jpg" alt="ESGE Days 2026 Milan" onerror="this.outerHTML='<div class=&quot;cert-no-img&quot;>Фото сертифіката (cert-esge-days-2026.jpg)</div>'">
        </div>
      </div>
    `
  },
  'cert-uzd-urinary-2026': {
    org: 'ГО «Асоціація спортивної медицини України» (Провайдер БПР №2122)',
    title: 'Сертифікат № 2026-2122-1023008-100062',
    body: `
      <div class="cert-detail">
        <p><strong>Захід:</strong> Майстер-клас «УЗД СЕЧОВИДІЛЬНОЇ СИСТЕМИ»</p>
        <p><strong>Дата:</strong> 17 березня 2026 року</p>
        <p><strong>Місце:</strong> м. Київ, Україна</p>
        <p><strong>Учасник:</strong> Тетернік Олег Олександрович</p>
        <p><strong>Бали БПР:</strong> 16,5 бала безперервного професійного розвитку</p>
        <div class="cert-detail__signatures">
          <p><strong>Підписи:</strong> Блонський Роман Іванович</p>
        </div>
        <div class="cert-detail__img-placeholder">
          <img src="img/certificates/cert-uzd-urinary-2026.jpg" alt="УЗД Сечовидільної системи" onerror="this.outerHTML='<div class=&quot;cert-no-img&quot;>Фото сертифіката (cert-uzd-urinary-2026.jpg)</div>'">
        </div>
      </div>
    `
  },
  'cert-endo-odesa-2025': {
    org: 'Провайдер №2429 ГО "Українська асоціація клінічної фармакології та фармакотерапії"',
    title: 'Сертифікат учасника №2025-2429-1011000-113117',
    body: `
      <div class="cert-detail">
        <p><strong>Захід:</strong> Майстер-клас "Ендоскопія: ЕндоОдеса-2025"</p>
        <p><strong>Дата:</strong> 19-21 червня 2025 року</p>
        <p><strong>Реєстраційний номер заходу:</strong> 1011000</p>
        <p><strong>Учасник:</strong> Олег Тетернік</p>
        <p><strong>Бали БПР:</strong> 20 балів БПР</p>
        <div class="cert-detail__signatures">
          <p><strong>Підписи:</strong> Святослав Семененко, Костянтин Науменко</p>
        </div>
        <div class="cert-detail__img-placeholder">
          <img src="img/certificates/cert-endo-odesa-2025.jpg" alt="ЕндоОдеса-2025" onerror="this.outerHTML='<div class=&quot;cert-no-img&quot;>Фото сертифіката (cert-endo-odesa-2025.jpg)</div>'">
        </div>
      </div>
    `
  },
  'cert-ercp-2025': {
    org: 'ТОВ "Ендо Тренінг" (Провайдер БПР №2364)',
    title: 'Сертифікат № 2025-2364-1018432-100016',
    body: `
      <div class="cert-detail">
        <p><strong>Захід:</strong> Майстер-клас «ЕРХПГ на практиці: від основ до впевненого виконання»</p>
        <p><strong>Дата:</strong> 2025 рік</p>
        <p><strong>Реєстраційний номер заходу:</strong> 1018432</p>
        <p><strong>Учасник:</strong> Тетернік Олег</p>
        <p><strong>Бали БПР:</strong> 21 бал БПР</p>
        <div class="cert-detail__signatures">
          <p><strong>Підписи:</strong> Анна Букіна (Директор ТОВ "Ендо Тренінг")</p>
        </div>
        <div class="cert-detail__img-placeholder">
          <img src="img/certificates/cert-ercp-2025.jpg" alt="ЕРХПГ на практиці" onerror="this.outerHTML='<div class=&quot;cert-no-img&quot;>Фото сертифіката (cert-ercp-2025.jpg)</div>'">
        </div>
      </div>
    `
  },
  'cert-infection-control-2025': {
    org: 'Вінницький національний медичний університет ім. М.І. Пирогова (Провайдер №2343)',
    title: 'Сертифікат № 2025-2343-1019008-100144',
    body: `
      <div class="cert-detail">
        <p><strong>Захід:</strong> Майстер-клас «Інфекційний контроль у практиці сімейного лікаря: сучасні стандарти та рішення»</p>
        <p><strong>Дата:</strong> 16 грудня 2025 року</p>
        <p><strong>Реєстраційний номер заходу:</strong> 1019008</p>
        <p><strong>Учасник:</strong> Тетернік Олег Олександрович</p>
        <p><strong>Бали БПР:</strong> 8 балів БПР</p>
        <div class="cert-detail__signatures">
          <p><strong>Підписи:</strong> Вікторія Петрушенко (Ректор ЗВО, професор)</p>
        </div>
        <div class="cert-detail__img-placeholder">
          <img src="img/certificates/cert-infection-control-2025.jpg" alt="Інфекційний контроль" onerror="this.outerHTML='<div class=&quot;cert-no-img&quot;>Фото сертифіката (cert-infection-control-2025.jpg)</div>'">
        </div>
      </div>
    `
  },
  'cert-kyiv-endo-2025': {
    org: 'ТОВ "Ендо Тренінг" (Провайдер БПР №2364)',
    title: 'Сертифікат № 2025-2364-1019491-100491',
    body: `
      <div class="cert-detail">
        <p><strong>Захід:</strong> Майстер-клас «Актуальні практики ендоскопії» (KYIV ENDO 2025)</p>
        <p><strong>Дата:</strong> 19-20 грудня 2025 року</p>
        <p><strong>Реєстраційний номер заходу:</strong> 1019491</p>
        <p><strong>Учасник:</strong> Тетернік Олег</p>
        <p><strong>Бали БПР:</strong> 21 бал БПР</p>
        <div class="cert-detail__signatures">
          <p><strong>Підписи:</strong> Анна Букіна (Директор ТОВ "Ендо Тренінг")</p>
        </div>
        <div class="cert-detail__img-placeholder">
          <img src="img/certificates/cert-kyiv-endo-2025.jpg" alt="KYIV ENDO 2025" onerror="this.outerHTML='<div class=&quot;cert-no-img&quot;>Фото сертифіката (cert-kyiv-endo-2025.jpg)</div>'">
        </div>
      </div>
    `
  },
  'cert-endo-lviv-2025': {
    org: 'Провайдер №2429 ГО "Українська асоціація клінічної фармакології та фармакотерапії"',
    title: 'Сертифікат № 2025-2429-1004430-113117',
    body: `
      <div class="cert-detail">
        <p><strong>Захід:</strong> Дводенний майстер-клас "Ендо Львів"</p>
        <p><strong>Дата:</strong> 10-11.01.2025</p>
        <p><strong>Реєстраційний номер заходу:</strong> 1004430</p>
        <p><strong>Учасник:</strong> Олег Тетернік</p>
        <p><strong>Бали БПР:</strong> 20 балів БПР (дійсний для лікарів усіх спеціальностей)</p>
        <div class="cert-detail__signatures">
          <p><strong>Підписи:</strong> Святослав Семененко, Владислав Яковенко, Назар Була</p>
        </div>
        <div class="cert-detail__img-placeholder">
          <img src="img/certificates/cert-endo-lviv-2025.jpg" alt="Ендо Львів" onerror="this.outerHTML='<div class=&quot;cert-no-img&quot;>Фото сертифіката (cert-endo-lviv-2025.jpg)</div>'">
        </div>
      </div>
    `
  },
  'cert-odesa-2024': {
    org: 'Провайдер №1136 ГО "Українська асоціація клінічної фармакології та фармакотерапії"',
    title: 'Сертифікат учасника №2024-1136-3707808-113117',
    body: `
      <div class="cert-detail">
        <p><strong>Захід:</strong> Дводенний майстер-клас "Одеса Ендо, 2024"</p>
        <p><strong>Дата:</strong> 20-21 червня 2024</p>
        <p><strong>Реєстраційний номер заходу:</strong> 3707808 у переліку захоів БПР 2024 року</p>
        <p><strong>Учасник:</strong> Олег Тетернік</p>
        <p><strong>Бали БПР:</strong> 20 балів БПР</p>
        <div class="cert-detail__signatures">
          <p><strong>Підписи:</strong> Святослав Семененко, Костянтин Науменко</p>
        </div>
        <div class="cert-detail__img-placeholder">
          <img src="img/certificates/cert-odesa-2024.jpg" alt="Одеса Ендо, 2024" onerror="this.outerHTML='<div class=&quot;cert-no-img&quot;>Фото сертифіката (cert-odesa-2024.jpg)</div>'">
        </div>
      </div>
    `
  },
  'cert-odesa-arkadia': {
    org: 'Провайдер №1136 ГО "Українська асоціація клінічної фармакології та фармакотерапії"',
    title: 'Сертифікат учасника №2024-1136-3707807-113117',
    body: `
      <div class="cert-detail">
        <p><strong>Захід:</strong> Майстер-клас "Ендо Одеса: Аркадія"</p>
        <p><strong>Дата:</strong> 22 червня 2024 року</p>
        <p><strong>Реєстраційний номер заходу:</strong> 3707807</p>
        <p><strong>Учасник:</strong> Олег Тетернік</p>
        <p><strong>Бали БПР:</strong> 10 балів БПР</p>
        <div class="cert-detail__signatures">
          <p><strong>Підписи:</strong> Святослав Семененко, Костянтин Науменко</p>
        </div>
        <div class="cert-detail__img-placeholder">
          <img src="img/certificates/cert-odesa-arkadia.jpg" alt="Ендо Одеса: Аркадія" onerror="this.outerHTML='<div class=&quot;cert-no-img&quot;>Фото сертифіката (cert-odesa-arkadia.jpg)</div>'">
        </div>
      </div>
    `
  }
};

function initDiplomas() {
  /* ── Tab switching ── */
  const tabs = document.querySelectorAll('.diplomas__tab');
  const panels = document.querySelectorAll('.diplomas__panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(`panel-${target}`);
      if (panel) panel.classList.add('active');
    });
  });

  /* ── Certificate Modal ── */
  const modal = document.getElementById('cert-modal');
  const backdrop = document.getElementById('cert-modal-backdrop');
  const closeBtn = document.getElementById('cert-modal-close');
  const modalOrg = document.getElementById('cert-modal-org');
  const modalTitle = document.getElementById('cert-modal-title');
  const modalBody = document.getElementById('cert-modal-body');

  if (!modal) return;

  function openCertModal(certId) {
    const data = CERT_DATA[certId];
    if (!data) return;
    if (modalOrg) modalOrg.textContent = data.org || '';
    if (modalTitle) modalTitle.textContent = data.title || '';
    if (modalBody) modalBody.innerHTML = data.body || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeCertModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Open via cert-card buttons
  document.querySelectorAll('.cert-card__btn[data-cert-id]').forEach(btn => {
    btn.addEventListener('click', () => openCertModal(btn.dataset.certId));
  });

  // Close via backdrop & X button
  if (backdrop) backdrop.addEventListener('click', closeCertModal);
  if (closeBtn) closeBtn.addEventListener('click', closeCertModal);

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeCertModal();
  });
}

/* ============================================================
   CERTIFICATES PAGINATION (LOAD MORE)
   ============================================================ */
function initCertsPagination() {
  const certCards = document.querySelectorAll('#panel-certificates .cert-card');
  const loadMoreBtn = document.getElementById('certs-load-more');
  const loadMoreWrapper = document.getElementById('certs-load-more-wrapper');
  
  if (!certCards.length || !loadMoreBtn) return;

  let currentLimit = 0;
  
  function getLimitIncrement() {
    return window.innerWidth >= 992 ? 9 : 3;
  }

  function applyPagination(isInit = false) {
    if (isInit) {
      currentLimit = getLimitIncrement();
    }
    
    let visibleCount = 0;
    
    certCards.forEach((card, index) => {
      if (index < currentLimit) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (visibleCount >= certCards.length) {
      if (loadMoreWrapper) loadMoreWrapper.style.display = 'none';
    } else {
      if (loadMoreWrapper) loadMoreWrapper.style.display = 'flex';
    }
  }

  loadMoreBtn.addEventListener('click', () => {
    currentLimit += getLimitIncrement();
    applyPagination();
  });

  applyPagination(true);
}


/* ============================================================
   TOPICS ACCORDION — Expandable details for blog topics
   ============================================================ */
function initTopicsAccordion() {
  const accordions = document.querySelectorAll('.stats__accordion');

  accordions.forEach(item => {
    const trigger = item;
    const content = item.querySelector('.stats__accordion-content');
    const moreBtnText = item.querySelector('.stats__more-btn');

    if (!content) return;

    // Toggle on click
    trigger.addEventListener('click', (e) => {
      // If user clicked inside the open content, don't close it automatically unless clicking close-trigger items
      if (e.target.closest('.stats__accordion-inner') && !e.target.closest('h4')) {
        return;
      }

      const isActive = item.classList.contains('active');

      // Close all other accordions for clean accordion-style behavior
      accordions.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.setAttribute('aria-expanded', 'false');
          const otherContent = otherItem.querySelector('.stats__accordion-content');
          if (otherContent) {
            otherContent.style.maxHeight = null;
            otherContent.setAttribute('aria-hidden', 'true');
          }
          const otherBtn = otherItem.querySelector('.stats__more-btn');
          if (otherBtn) otherBtn.textContent = 'Дізнатися більше';
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        item.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = null;
        content.setAttribute('aria-hidden', 'true');
        if (moreBtnText) moreBtnText.textContent = 'Дізнатися більше';
      } else {
        item.classList.add('active');
        item.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
        content.setAttribute('aria-hidden', 'false');
        if (moreBtnText) moreBtnText.textContent = 'Згорнути';
      }
    });

    // Support keyboard activation (Enter or Space)
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });
}



