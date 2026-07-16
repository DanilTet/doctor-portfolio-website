const fs = require('fs');
const cheerio = require('cheerio');

const translations = {
  ru: {
    'logo.main': 'Эндоскопия',
    'logo.accent': 'простыми словами',
    'nav.about': 'О враче',
    'nav.services': 'Услуги',
    'nav.diplomas': 'Дипломы',
    'nav.reviews': 'Отзывы',
    'nav.contacts': 'Контакты',
    'nav.appointment': 'Записаться на прием',
    'nav.blog': 'Блог',
    'nav.topics': 'Темы',
    'nav.ask': 'Задать вопрос',
    'hero.badge.blog': 'Образовательный блог врача Олега Тетерника',
    'hero.title.main': 'Эндоскопия',
    'hero.title.accent': 'простыми словами',
    'hero.specialization': 'Рассказываю про гастроскопию, колоноскопию, подготовку и лечение без мифов и лишнего страха. Советы врача-эндоскописта, хирурга, врача УЗИ с 8-летним опытом.',
    'hero.experience.number': '8',
    'hero.experience.label': 'Лет профессионального\nопыта в медицине',
    'hero.btn.blog': 'Читать блог',
    'hero.btn.ask': 'Задать вопрос',
    'hero.float.value': '5000+',
    'hero.float.label': 'Довольных пациентов',
    'hero.scroll': 'Листайте вниз',
    'stats.exp.label': 'Лет опыта',
    'stats.exp.sub': 'в эндоскопии и медицине',
    'stats.patients.label': 'Процедур в год',
    'stats.patients.sub': 'более 3000 исследований',
    'stats.patients.live': 'Ежегодно',
    'stats.spec.number': 'Эндоскопист',
    'stats.spec.label': 'Специализация',
    'stats.spec.sub': 'диагностическая и лечебная эндоскопия',
    'section.stats': 'Цифры доверия',
    'section.about': 'О враче',
    'section.services': 'Услуги',
    'section.diplomas': 'Дипломы и сертификаты',
    'section.reviews': 'Отзывы пациентов',
    'section.contacts': 'Контакты',
    'about.subtitle': 'Знакомство с врачом',
    'about.title': 'Тетерник Олег Александрович',
    'about.role': 'Врач Хирург Эндоскопист',
    'about.bio.1': 'Профессионал с 8-летним опытом в проведении высокоточных эндоскопических и хирургических вмешательств. Основной приоритет — максимальная безопасность, безболезненность и комфорт пациента во время каждой процедуры.',
    'about.bio.2': 'Благодаря современному оборудованию и индивидуальному подходу, мы обеспечиваем точную диагностику и эффективное лечение заболеваний желудочно-кишечного тракта.',
    'about.spec.1': 'Гастроскопия',
    'about.spec.2': 'Колоноскопия',
    'about.spec.3': 'ЭРХПГ',
    'about.spec.4': 'Бронхоскопия',
    'about.spec.5': 'УЗИ',
    'about.spec.6': 'Хирургия',
    'about.card.location.label': 'Место приема',
    'about.card.location.value': '17 больница, г.Харьков, пр.Героев Харькова 195',
    'about.card.phone.label': 'Телефон',
    'about.btn': 'Записаться на прием',
    'services.subtitle': 'Направления и исследования',
    'services.title': 'Медицинские услуги',
    'services.card.btn': 'Подробнее о процедуре',
    'services.modal.close': 'Закрыть',
    'services.modal.appointment': 'Записаться на прием',
    'services.modal.steps_title': 'Пошаговый процесс процедуры',
    'appointment.modal.title': 'Запись на прием',
    'appointment.modal.subtitle': 'Заполните форму на сайте или воспользуйтесь Telegram-ботом',
    'appointment.form.name.label': 'Ваше имя (ФИО)',
    'appointment.form.name.placeholder': 'Иванов Иван Иванович',
    'appointment.form.phone.label': 'Номер телефона',
    'appointment.form.phone.placeholder': '+380XXXXXXXXX',
    'appointment.form.service.label': 'Выберите услугу',
    'appointment.form.comment.label': 'Краткий комментарий / симптомы (опционально)',
    'appointment.form.comment.placeholder': 'Опишите, что вас беспокоит или желаемое время...',
    'appointment.form.submit': 'Отправить заявку',
    'appointment.divider': 'или заполните онлайн-форму',
    'appointment.tg.btn': 'Записаться через Telegram-бот',
    'appointment.success.title': 'Спасибо! Заявка принята',
    'appointment.success.desc': 'Мы перезвоним вам в ближайшее время для подтверждения времени приема.',
    'appointment.success.btn': 'Понятно',
    'contacts.subtitle': 'Локация и связь',
    'contacts.title': 'Контактная информация',
    'contacts.address.label': 'Место приема',
    'contacts.address.value': '17-я городская больница, г. Харьков, пр. Героев Харькова 195',
    'contacts.schedule.label': 'График приема',
    'contacts.schedule.value': 'Пн – Сб: 08:00 – 15:00',
    'contacts.schedule.sub': 'Воскресенье: выходной',
    'contacts.phone.label': 'Телефон для записи',
    'contacts.instagram.label': 'Официальный Instagram',
    'contacts.navigation.title': 'Как найти корпус хирургии?',
    'contacts.navigation.desc': 'Смотрите пошаговую видеоинструкцию в сохраненных Историях Instagram',
    'contacts.navigation.btn': 'Посмотреть маршрут',
    'contacts.map.btn': 'Открыть в Google Maps',
    'contacts.appointment.btn': 'Записаться на прием',
    'reviews.subtitle': 'Доверие и реальный опыт',
    'reviews.title': 'Отзывы пациентов',
    'reviews.btn.leave': 'Оставить отзыв',
    'reviews.rating.count': 'на основе отзывов пациентов',
    'reviews.loading': 'Загрузка отзывов...',
    'reviews.empty': 'Пока нет опубликованных отзывов. Будьте первым!',
    'reviews.modal.title': 'Ваш отзыв о приеме',
    'reviews.modal.subtitle': 'Поделитесь вашими впечатлениями от процедуры или консультации',
    'reviews.modal.name.label': 'Ваше имя (ФИО)',
    'reviews.modal.name.placeholder': 'Елена Мельник',
    'reviews.modal.stars.label': 'Ваша оценка',
    'reviews.modal.text.label': 'Текст отзыва',
    'reviews.modal.text.placeholder': 'Напишите ваши впечатления от визита, отношение врача...',
    'reviews.modal.submit': 'Отправить отзыв',
    'reviews.success.title': 'Спасибо за ваш отзыв!',
    'reviews.success.desc': 'Ваш отзыв успешно сохранен и будет опубликован после модерации.',
    'exhibits.esge.city': 'г. Милан, Италия',
    'exhibits.esge.title': 'ESGE Days 2026',
    'exhibits.esge.desc': 'Международная эндоскопическая конференция. Обмен опытом с ведущими европейскими специалистами, обсуждение новейших стандартов и технологий в оперативной эндоскопии.',
    'exhibits.kiev.city': 'г. Киев, Украина',
    'exhibits.kiev.title': 'KievEndo 2023',
    'exhibits.kiev.desc': 'Научно-практическая конференция. Презентация клинических случаев, обсуждение современных методик малоинвазивной хирургии и диагностической эндоскопии в Украине.',
    'footer.copy': '© 2026 Тетерник О.О. Все права защищены.',
    'diplomas.subtitle': 'Образование и достижения',
    'diplomas.title': 'Дипломы и сертификаты',
    'diplomas.tab.education': 'Образование',
    'diplomas.tab.certificates': 'Сертификаты',
    'diplomas.tab.exhibitions': 'Конференции и выставки',
  },
  en: {
    'logo.main': 'Endoscopy',
    'logo.accent': 'in simple terms',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.diplomas': 'Diplomas',
    'nav.reviews': 'Reviews',
    'nav.contacts': 'Contacts',
    'nav.appointment': 'Book Appointment',
    'nav.blog': 'Blog',
    'nav.topics': 'Topics',
    'nav.ask': 'Ask a Question',
    'hero.badge.blog': 'Educational blog of Dr. Oleg Teternik',
    'hero.title.main': 'Endoscopy',
    'hero.title.accent': 'in simple terms',
    'hero.specialization': 'Explaining gastroscopy, colonoscopy, preparation, and treatment without myths and unnecessary fear. Advice from an endoscopist, surgeon, and ultrasound specialist with 8 years of experience.',
    'hero.experience.number': '8',
    'hero.experience.label': 'Years of professional\nexperience in medicine',
    'hero.btn.blog': 'Read Blog',
    'hero.btn.ask': 'Ask a Question',
    'hero.float.value': '5000+',
    'hero.float.label': 'Satisfied patients',
    'hero.scroll': 'Scroll down',
    'stats.exp.label': 'Years of Experience',
    'stats.exp.sub': 'in endoscopy & medicine',
    'stats.patients.label': 'Procedures per year',
    'stats.patients.sub': 'over 3000 examinations',
    'stats.patients.live': 'Annually',
    'stats.spec.number': 'Endoscopist',
    'stats.spec.label': 'Specialization',
    'stats.spec.sub': 'diagnostic & therapeutic endoscopy',
    'section.stats': 'Trust in Numbers',
    'section.about': 'About the Doctor',
    'section.services': 'Services',
    'section.diplomas': 'Diplomas & Certificates',
    'section.reviews': 'Patient Reviews',
    'section.contacts': 'Contacts',
    'about.subtitle': 'Meet the Doctor',
    'about.title': 'Teternik Oleg Oleksandrovych',
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
    'services.subtitle': 'Fields & Diagnostics',
    'services.title': 'Medical Services',
    'services.card.btn': 'Learn More About Procedure',
    'services.modal.close': 'Close',
    'services.modal.appointment': 'Book Appointment',
    'services.modal.steps_title': 'Step-by-Step Procedure Process',
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
    'exhibits.esge.city': 'Milan, Italy',
    'exhibits.esge.title': 'ESGE Days 2026',
    'exhibits.esge.desc': 'International Endoscopic Conference. Exchange of experience with leading European specialists, discussion of the latest standards and technologies in operative endoscopy.',
    'exhibits.kiev.city': 'Kyiv, Ukraine',
    'exhibits.kiev.title': 'KievEndo 2023',
    'exhibits.kiev.desc': 'Scientific and Practical Conference. Presentation of clinical cases, discussion of modern techniques of minimally invasive surgery and diagnostic endoscopy in Ukraine.',
    'footer.copy': '© 2026 Teternik O.O. All rights reserved.',
    'diplomas.subtitle': 'Education & Achievements',
    'diplomas.title': 'Diplomas & Certificates',
    'diplomas.tab.education': 'Education',
    'diplomas.tab.certificates': 'Certificates',
    'diplomas.tab.exhibitions': 'Conferences & Exhibitions',
  }
};

const html = fs.readFileSync('index.html', 'utf8');

function generateLang(langCode) {
    const $ = cheerio.load(html, { decodeEntities: false });
    const langData = translations[langCode];

    // Replace text using data-i18n
    $('[data-i18n]').each(function() {
        const key = $(this).attr('data-i18n');
        if (langData[key]) {
            const children = $(this).children('svg, img, .hero__badge-dot');
            if (children.length > 0) {
               let textNodeReplaced = false;
               $(this).contents().each(function() {
                  if (this.nodeType === 3 && this.nodeValue.trim() !== '' && !textNodeReplaced) {
                      this.nodeValue = this.nodeValue.replace(/[\\s\\S]+/, langData[key]);
                      textNodeReplaced = true;
                  }
               });
            } else {
               $(this).text(langData[key]);
            }
        }
    });

    // Update SEO meta tags based on lang
    $('html').attr('lang', langCode);
    
    // Update active class in language switcher
    $('.lang-switch__btn').removeClass('active');
    if (langCode === 'ru') {
        $('a.lang-switch__btn:contains("RU")').addClass('active');
        $('title').text('Врач Тетерник О. А. — Эндоскопист, Хирург, УЗИ | Отзывы');
        $('meta[property="og:title"]').attr('content', 'Врач Тетерник О. А. — Эндоскопист, Хирург, УЗИ | Отзывы');
        $('meta[name="description"]').attr('content', 'Тетерник Олег Александрович — врач-эндоскопист, хирург, УЗИ. Отзывы пациентов. Эндоскопия в Харькове.');
    } else if (langCode === 'en') {
        $('a.lang-switch__btn:contains("EN")').addClass('active');
        $('title').text('Dr. Teternik O. O. — Endoscopist, Surgeon, Ultrasound | Reviews');
        $('meta[property="og:title"]').attr('content', 'Dr. Teternik O. O. — Endoscopist, Surgeon, Ultrasound | Reviews');
        $('meta[name="description"]').attr('content', 'Teternik Oleg Oleksandrovych — Endoscopist, Surgeon, Ultrasound. Patient reviews. Endoscopy in Kharkiv.');
    }

    fs.writeFileSync(`${langCode}.html`, $.html());
    console.log(`Generated ${langCode}.html`);
}

generateLang('ru');
generateLang('en');
