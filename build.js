const fs = require('fs');
const path = require('path');
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
    'hero.badge.blog': 'Образовательный blog врача Олега Тетерника',
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
    'topics.more': 'Узнать больше',
    'topics.less': 'Свернуть',
    'topics.gastro.label': 'Гастроскопия',
    'topics.gastro.sublabel': 'Подготовка, процесс, результаты',
    'topics.gastro.q1': 'Что это такое?',
    'topics.gastro.a1': 'Это осмотр слизистой оболочки пищевода, желудка и двенадцатиперстной кишки с помощью гибкого тонкого зонда с видеокамерой.',
    'topics.gastro.q2': 'Когда стоит пройти?',
    'topics.gastro.li1': 'Частая изжога, отрыжка, горечь во рту',
    'topics.gastro.li2': 'Боль в верхней части живота (натощак или после еды)',
    'topics.gastro.li3': 'Длительная тошнота или проблемы с глотанием',
    'topics.gastro.q3': 'Как подготовиться?',
    'topics.gastro.a3': 'Процедура проводится исключительно <strong>натощак</strong>. Последний прием пищи — минимум за 8-10 часов до исследования. Воду нельзя пить за 3-4 часа до процедуры.',
    'topics.gastro.btn': 'Детальнее про Гастроскопию',
    'topics.colono.label': 'Колоноскопия',
    'topics.colono.sublabel': 'Как не бояться и подготовиться',
    'topics.colono.q1': 'Почему это жизненно важно?',
    'topics.colono.a1': 'Это золотой стандарт профилактики рака толстой кишки. Позволяет обнаружить и сразу удалить полипы (доброкачественные новообразования) до того, как они станут опасными.',
    'topics.colono.q2': 'Больно ли это?',
    'topics.colono.a2': 'Современная колоноскопия в 95% случаев проводится <strong>в состоянии медикаментозного сна (седации)</strong>. Вы просто спите 15-20 минут и не чувствуете никакого дискомфорта.',
    'topics.colono.q3': 'Главное в подготовке:',
    'topics.colono.a3': 'Качество осмотра на 90% зависит от чистоты кишечника. Необходимо за 3 дня соблюдать бесшлаковую диету и накануне выпить специальный очищающий раствор по схеме.',
    'topics.colono.btn': 'Детальнее про Колоноскопию',
    'topics.usg.label': 'УЗИ и хирургия',
    'topics.usg.sublabel': 'Когда и зачем нужны',
    'topics.usg.q1': 'УЗИ диагностика',
    'topics.usg.a1': 'Быстрый и безопасный метод проверить состояние внутренних органов (печени, желчного пузыря, поджелудочной железы, почек) без облучения.',
    'topics.usg.q2': 'Оперативная эндоскопия',
    'topics.usg.a2': 'Это хирургия без разрезов. Благодаря эндоскопу врач может удалить инородные тела, остановить внутреннее кровотечение или выполнить полипэктомию (удаление полипов желудка или кишечника) непосредственно во время осмотра.',
    'topics.usg.q3': 'Преимущества:',
    'topics.usg.a3': 'Пациент восстанавливается уже через несколько часов после вмешательства и может возвращаться к обычной жизни.',
    'topics.usg.btn1': 'Детальнее про УЗИ',
    'topics.usg.btn2': 'Детальнее про Хирургию',
    'blog.subtitle': 'Экспертные материалы',
    'blog.title': 'Блог об эндоскопии',
    'blog.desc': 'Врач-эндоскопист Тетерник О.О. рассказывает о процедурах, развенчивает мифы и делится полезными советами по подготовке к эндоскопии.',
    'blog.empty': 'Посты еще не опубликованы.',
    'diplomas.subtitle': 'Образование и достижения',
    'diplomas.title': 'Дипломы и сертификаты',
    'diplomas.tab.education': 'Образование',
    'diplomas.tab.certificates': 'Сертификаты',
    'diplomas.tab.exhibitions': 'Конференции и выставки',

    // Нові ключі для сторінок послуг
    'service.back': 'Назад на главную',
    'service.gastro.meta.title': 'Гастроскопия | Врач Тетерник О.А.',
    'service.gastro.title': 'Гастроскопия',
    'service.gastro.subtitle': 'Современное эндоскопическое исследование желудка без мифов, боли и страха.',
    'service.gastro.p1': '<strong>Гастроскопия (видеоэзофагогастродуоденоскопия или ВГДС)</strong> — это высокоточный метод визуального осмотра пищевода, желудка и двенадцатиперстной кишки с помощью современного гибкого эндоскопа.',
    'service.gastro.p2': 'Эта процедура является «золотым стандартом» в диагностике гастрита, язвенной болезни, рефлюкса и выявлении ранних стадий онкологических заболеваний желудочно-кишечного тракта.',
    'service.gastro.h1': 'Показания к проведению:',
    'service.gastro.li1': 'Боль или дискомфорт в верхней части живота.',
    'service.gastro.li2': 'Частая изжога, кислая отрыжка, горечь во рту.',
    'service.gastro.li3': 'Ощущение «комка» при глотании пищи.',
    'service.gastro.li4': 'Длительная тошнота, рвота или быстрая потеря веса.',
    'service.gastro.h2': 'Как подготовиться?',
    'service.gastro.p3': 'Исследование проводится исключительно <strong>натощак</strong>. Последний прием пищи должен быть не позднее, чем за 8–10 часов до начала процедуры. Воду (без газа, чистую) можно пить в небольшом количестве минимум за 3–4 часа до обследования.',
    'service.gastro.btn': 'Записаться на гастроскопию',

    'service.colono.meta.title': 'Колоноскопия (КС) | Врач Тетерник О.А.',
    'service.colono.title': 'Колоноскопия (видеоколоноскопия)',
    'service.colono.subtitle': 'Эффективное обследование толстого кишечника в состоянии медикаментозного сна.',
    'service.colono.p1': '<strong>Видеоколоноскопия (ФКС)</strong> — высокоточный эндоскопический метод исследования, который позволяет врачу детально осмотреть слизистую оболочку толстой кишки изнутри с помощью специального гибкого зонда (колоноскопа).',
    'service.colono.p2': 'Процедура незаменима для ранней диагностики онкологических заболеваний, колитов, выявления источников кровотечений и удаления полипов (доброкачественных образований), что предупреждает развитие тяжелых патологий.',
    'service.colono.h1': 'Показания к проведению:',
    'service.colono.li1': 'Хронические запоры, диарея или частое вздуное живота.',
    'service.colono.li2': 'Появление крови или слизи в кале.',
    'service.colono.li3': 'Анемия неясного происхождения или постоянная слабость.',
    'service.colono.li4': 'Возраст старше 40 лет (для профилактического скрининга).',
    'service.colono.h2': 'Болезненно ли это?',
    'service.colono.p3': 'Сегодня колоноскопия проводится во **медикаментозном сне (под седацией)**. Вы не почувствуете никаких неприятных симптомов или боли. Процедура длится около 15-20 минут, а после пробуждения вы сможете отдохнуть в палате и спокойно вернуться домой.',
    'service.colono.btn': 'Записаться на колоноскопию',

    'service.uzd.meta.title': 'УЗИ (ультразвуковая диагностика) | Врач Тетерник О.А.',
    'service.uzd.title': 'УЗИ (Ультразвуковая диагностика)',
    'service.uzd.subtitle': 'Безопасный, безболезненный и точный метод оценки внутренних органов.',
    'service.uzd.p1': '<strong>Ультразвуковая диагностика (УЗИ)</strong> — это быстрый, доступный и полностью безопасный метод медицинского обследования, использующий высокочастотные звуковые волны для получения изображений внутренних органов в реальном времени.',
    'service.uzd.p2': 'Благодаря отсутствию радиационного излучения, процедуру можно проводить многократно для отслеживания динамики лечения. Она позволяет оценить размеры, структуру и кровообращение в исследуемых органах.',
    'service.uzd.h1': 'Что можно обследовать:',
    'service.uzd.li1': 'Органы брюшной полости (печень, желчный пузырь, поджелудочная железа, селезенка).',
    'service.uzd.li2': 'Почки и органы мочевыделительной системы.',
    'service.uzd.li3': 'Щитовидную железу.',
    'service.uzd.li4': 'Мягкие ткани и лимфатические узлы.',
    'service.uzd.h2': 'Как подготовиться?',
    'service.uzd.p3': 'Для УЗИ брюшной полости рекомендуется за 2-3 дня исключить из рациона газообразующие продукты (бобовые, капусту, черный хлеб, газированные напитки) и проходить обследование натощак. Для других видов УЗИ специальная подготовка обычно не требуется.',
    'service.uzd.btn': 'Записаться на УЗИ',

    'service.surgery.meta.title': 'Хирургия и малоинвазивные вмешательства | Врач Тетерник О.А.',
    'service.surgery.title': 'Хирургия и малоинвазивные вмешательства',
    'service.surgery.subtitle': 'Современные хирургические методики и эндоскопические операции без традиционных разрезов.',
    'service.surgery.p1': '<strong>Малоинвазивная и оперативная хирургия</strong> — это современный подход к проведению операций с минимальным повреждением тканей организма пациента, что значительно сокращает время восстановления и снижает риск осложнений.',
    'service.surgery.p2': 'Благодаря сочетанию хирургических и эндоскопических техник (оперативная эндоскопия), многие процедуры, ранее требовавшие больших разрезов и длительной госпитализации, сейчас выполняются через естественные отверстия или небольшие проколы под визуальным контролем.',
    'service.surgery.h1': 'Виды вмешательств:',
    'service.surgery.li1': 'Эндоскопическая полипэктомия желудка, двенадцатиперстной кишки и толстого кишечника.',
    'service.surgery.li2': 'Эндоскопическая остановка желудочно-кишечных кровотечений.',
    'service.surgery.li3': 'Удаление инородных тел из ЖКТ.',
    'service.surgery.li4': 'Амбулаторные хирургические вмешательства и малоинвазивное лечение.',
    'service.surgery.h2': 'Преимущества для пациента:',
    'service.surgery.p3': 'Малоинвазивные операции обладают низким болевым синдромом, отличным косметическим эффектом (отсутствие рубцов) и позволяют пациенту вернуться к полноценной жизни уже через несколько дней после процедуры.',
    'service.surgery.btn': 'Получить консультацию хирурга',
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
    'topics.more': 'Learn More',
    'topics.less': 'Collapse',
    'topics.gastro.label': 'Gastroscopy',
    'topics.gastro.sublabel': 'Preparation, procedure, results',
    'topics.gastro.q1': 'What is it?',
    'topics.gastro.a1': 'An examination of the lining of the esophagus, stomach, and duodenum using a flexible, thin scope with a video camera.',
    'topics.gastro.q2': 'When should you get one?',
    'topics.gastro.li1': 'Frequent heartburn, belching, bitterness in the mouth',
    'topics.gastro.li2': 'Pain in the upper abdomen (on an empty stomach or after eating)',
    'topics.gastro.li3': 'Persistent nausea or difficulty swallowing',
    'topics.gastro.q3': 'How to prepare?',
    'topics.gastro.a3': 'The procedure is performed strictly <strong>fasting</strong>. Last meal — at least 8-10 hours before the examination. Do not drink water 3-4 hours before the procedure.',
    'topics.gastro.btn': 'Details about Gastroscopy',
    'topics.colono.label': 'Colonoscopy',
    'topics.colono.sublabel': 'How to prepare and overcome fear',
    'topics.colono.q1': 'Why is it vital?',
    'topics.colono.a1': 'The gold standard for colon cancer prevention. Allows detecting and immediately removing polyps (benign growths) before they become dangerous.',
    'topics.colono.q2': 'Is it painful?',
    'topics.colono.a2': 'Modern colonoscopy is performed <strong>under sedation (medical sleep)</strong> in 95% of cases. You simply sleep for 15-20 minutes and do not feel any discomfort.',
    'topics.colono.q3': 'Key to preparation:',
    'topics.colono.a3': 'The quality of the exam is 90% dependent on bowel cleanliness. Follow a low-residue diet for 3 days and drink a special bowel-prep solution the night before.',
    'topics.colono.btn': 'Details about Colonoscopy',
    'topics.usg.label': 'Ultrasound & Surgery',
    'topics.usg.sublabel': 'When and why you need them',
    'topics.usg.q1': 'Ultrasound Diagnostics',
    'topics.usg.a1': 'A quick and safe method to check the condition of internal organs (liver, gallbladder, pancreas, kidneys) without radiation.',
    'topics.usg.q2': 'Operative Endoscopy',
    'topics.usg.a2': 'This is surgery without incisions. With the endoscope, the doctor can remove foreign bodies, stop internal bleeding, or perform a polypectomy (removal of stomach or bowel polyps) during the examination.',
    'topics.usg.q3': 'Advantages:',
    'topics.usg.a3': 'The patient recovers within a few hours after the procedure and can return to normal life.',
    'topics.usg.btn1': 'Details about Ultrasound',
    'topics.usg.btn2': 'Details about Surgery',
    'blog.subtitle': 'Expert Materials',
    'blog.title': 'Blog about Endoscopy',
    'blog.desc': 'Endoscopist Dr. Oleg Teternik explains procedures, busts myths, and shares useful tips for endoscopy preparation.',
    'blog.empty': 'No posts published yet.',
    'diplomas.subtitle': 'Education & Achievements',
    'diplomas.title': 'Diplomas & Certificates',
    'diplomas.tab.education': 'Education',
    'diplomas.tab.certificates': 'Certificates',
    'diplomas.tab.exhibitions': 'Conferences & Exhibitions',

    // New keys for English service pages
    'service.back': 'Back to homepage',
    'service.gastro.meta.title': 'Gastroscopy | Dr. Teternik O.O.',
    'service.gastro.title': 'Gastroscopy',
    'service.gastro.subtitle': 'Modern endoscopic examination of the stomach without fear, pain, and discomfort.',
    'service.gastro.p1': '<strong>Gastroscopy (esophagogastroduodenoscopy or EGD)</strong> — is a highly precise method of visual examination of the esophagus, stomach, and duodenum using a modern flexible endoscope.',
    'service.gastro.p2': 'This procedure is the "gold standard" in diagnosing gastritis, peptic ulcer disease, reflux, and detecting early stages of oncological diseases of the gastrointestinal tract.',
    'service.gastro.h1': 'Indications for the procedure:',
    'service.gastro.li1': 'Pain or discomfort in the upper abdomen.',
    'service.gastro.li2': 'Frequent heartburn, sour belching, bitterness in the mouth.',
    'service.gastro.li3': 'Sensation of a "lump" when swallowing food.',
    'service.gastro.li4': 'Persistent nausea, vomiting, or rapid weight loss.',
    'service.gastro.h2': 'How to prepare?',
    'service.gastro.p3': 'The examination is performed strictly <strong>fasting</strong>. The last meal should be no later than 8–10 hours before the procedure. Clean water (non-carbonated) can be drunk in small amounts at least 3–4 hours before the examination.',
    'service.gastro.btn': 'Book a Gastroscopy',

    'service.colono.meta.title': 'Colonoscopy (CS) | Dr. Teternik O.O.',
    'service.colono.title': 'Colonoscopy (videocolonoscopy)',
    'service.colono.subtitle': 'Effective examination of the large intestine under medical sleep.',
    'service.colono.p1': '<strong>Videocolonoscopy (CS)</strong> — is a highly precise endoscopic examination method that allows the doctor to inspect the lining of the large intestine in detail from the inside using a special flexible probe (colonoscope).',
    'service.colono.p2': 'The procedure is indispensable for the early diagnosis of oncological diseases, colitis, identifying sources of bleeding, and removing polyps (benign growths), which prevents the development of severe pathologies.',
    'service.colono.h1': 'Indications for the procedure:',
    'service.colono.li1': 'Chronic constipation, diarrhea, or frequent bloating.',
    'service.colono.li2': 'Blood or mucus in stool.',
    'service.colono.li3': 'Anemia of unexplained origin or persistent weakness.',
    'service.colono.li4': 'Age over 40 years (for preventative screening).',
    'service.colono.h2': 'Is it painful?',
    'service.colono.p3': 'Today, colonoscopy is performed <strong>under sedation (medical sleep)</strong> in 95% of cases. You will not feel any unpleasant symptoms or pain. The procedure lasts about 15-20 minutes, and after waking up, you can rest in the room and safely return home.',
    'service.colono.btn': 'Book a Colonoscopy',

    'service.uzd.meta.title': 'Ultrasound Diagnostics | Dr. Teternik O.O.',
    'service.uzd.title': 'Ultrasound (Ultrasound Diagnostics)',
    'service.uzd.subtitle': 'Safe, painless, and accurate method of evaluating internal organs.',
    'service.uzd.p1': '<strong>Ultrasound Diagnostics (USG)</strong> — is a fast, accessible, and completely safe medical examination method that uses high-frequency sound waves to obtain real-time images of internal organs.',
    'service.uzd.p2': 'Due to the lack of radiation exposure, the procedure can be performed repeatedly to track treatment dynamics. It allows evaluating the size, structure, and blood circulation in the organs being examined.',
    'service.uzd.h1': 'What can be examined:',
    'service.uzd.li1': 'Abdominal cavity organs (liver, gallbladder, pancreas, spleen).',
    'service.uzd.li2': 'Kidneys and urinary tract organs.',
    'service.uzd.li3': 'Thyroid gland.',
    'service.uzd.li4': 'Soft tissues and lymph nodes.',
    'service.uzd.h2': 'How to prepare?',
    'service.uzd.p3': 'For abdominal ultrasound, it is recommended to exclude gas-producing foods (beans, cabbage, black bread, carbonated drinks) from the diet 2-3 days prior and undergo the examination fasting. For other types of ultrasound, special preparation is usually not required.',
    'service.uzd.btn': 'Book an Ultrasound',

    'service.surgery.meta.title': 'Surgery & Minimally Invasive Interventions | Dr. Teternik O.O.',
    'service.surgery.title': 'Surgery and Minimally Invasive Interventions',
    'service.surgery.subtitle': 'Modern surgical techniques and endoscopic operations without traditional incisions.',
    'service.surgery.p1': '<strong>Minimally invasive and operative surgery</strong> — is a modern approach to performing operations with minimal damage to the patient\'s body tissues, which significantly reduces recovery time and lowers the risk of complications.',
    'service.surgery.p2': 'Thanks to the combination of surgical and endoscopic techniques (operative endoscopy), many procedures that previously required large incisions and long hospitalization are now performed through natural openings or small punctures under visual control.',
    'service.surgery.h1': 'Types of interventions:',
    'service.surgery.li1': 'Endoscopic polypectomy of the stomach, duodenum, and large intestine.',
    'service.surgery.li2': 'Endoscopic control of gastrointestinal bleeding.',
    'service.surgery.li3': 'Removal of foreign bodies from the GI tract.',
    'service.surgery.li4': 'Outpatient surgical interventions and minimally invasive treatment.',
    'service.surgery.h2': 'Advantages for the patient:',
    'service.surgery.p3': 'Minimally invasive surgeries have low pain levels, excellent cosmetic results (no scars), and allow the patient to return to full life within a few days after the procedure.',
    'service.surgery.btn': 'Get a Consultation with a Surgeon',
  }
};

const html = fs.readFileSync('index.html', 'utf8');

// Compile page with translations
function compilePage(sourceHtml, langCode) {
    const $ = cheerio.load(sourceHtml, { decodeEntities: false });
    const langData = translations[langCode];

    if (langData) {
        $('[data-i18n]').each(function() {
            const key = $(this).attr('data-i18n');
            if (langData[key]) {
                const children = $(this).children('svg, img, .hero__badge-dot');
                if (children.length > 0) {
                   let textNodeReplaced = false;
                   $(this).contents().each(function() {
                      if (this.nodeType === 3 && this.nodeValue.trim() !== '' && !textNodeReplaced) {
                          this.nodeValue = this.nodeValue.replace(/[\s\S]+/, langData[key]);
                          textNodeReplaced = true;
                      }
                   });
                } else {
                   $(this).html(langData[key]);
                }
            }
        });
    }

    // Set HTML lang attribute
    $('html').attr('lang', langCode);

    return $;
}

// Generate translations for Main Landing Page
function generateMainLangs() {
    // RU main page
    const $ru = compilePage(html, 'ru');
    $ru('.lang-switch__btn').removeClass('active');
    $ru('a.lang-switch__btn:contains("RU")').addClass('active');
    $ru('title').text('Врач Тетерник О. А. — Эндоскопист, Хирург, УЗИ | Отзывы');
    $ru('meta[property="og:title"]').attr('content', 'Врач Тетерник О. А. — Эндоскопист, Хирург, УЗИ | Отзывы');
    $ru('meta[name="description"]').attr('content', 'Тетерник Олег Александрович — врач-эндоскопист, хирург, УЗИ. Отзывы пациентов. Эндоскопия в Харькове.');
    
    // Redirect internal links to localized routes in RU main page
    localizeLinks($ru, 'ru');
    fs.writeFileSync('ru.html', $ru.html());
    console.log('Generated ru.html');

    // EN main page
    const $en = compilePage(html, 'en');
    $en('.lang-switch__btn').removeClass('active');
    $en('a.lang-switch__btn:contains("EN")').addClass('active');
    $en('title').text('Dr. Teternik O. O. — Endoscopist, Surgeon, Ultrasound | Reviews');
    $en('meta[property="og:title"]').attr('content', 'Dr. Teternik O. O. — Endoscopist, Surgeon, Ultrasound | Reviews');
    $en('meta[name="description"]').attr('content', 'Teternik Oleg Oleksandrovych — Endoscopist, Surgeon, Ultrasound. Patient reviews. Endoscopy in Kharkiv.');
    
    // Redirect internal links to localized routes in EN main page
    localizeLinks($en, 'en');
    fs.writeFileSync('en.html', $en.html());
    console.log('Generated en.html');
}

// Localize subpage links for translated pages
function localizeLinks($, langCode) {
    const pages = ['gastroscopy', 'colonoscopy', 'uzd', 'surgery'];
    pages.forEach(p => {
        $(`a[href^="/${p}/"]`).not('.lang-switch a').each(function() {
            $(this).attr('href', `/${langCode}/${p}/`);
        });
    });
}

// Generate subpages (Gastroscopy, Colonoscopy, UZD, Surgery)
function generateSubpages() {
    const subpages = ['gastroscopy', 'colonoscopy', 'uzd', 'surgery'];

    subpages.forEach(page => {
        const pageHtmlPath = `${page}.html`;
        if (!fs.existsSync(pageHtmlPath)) {
            console.warn(`Source page not found: ${pageHtmlPath}`);
            return;
        }

        const baseHtml = fs.readFileSync(pageHtmlPath, 'utf8');

        // 1. Generate UA (default) subpage: /page/index.html
        fs.mkdirSync(path.join(__dirname, page), { recursive: true });
        const $ua = cheerio.load(baseHtml, { decodeEntities: false });
        fs.writeFileSync(path.join(__dirname, page, 'index.html'), $ua.html());
        console.log(`Generated UA subpage: /${page}/index.html`);

        // 2. Generate RU subpage: /ru/page/index.html
        fs.mkdirSync(path.join(__dirname, 'ru', page), { recursive: true });
        const $ru = compilePage(baseHtml, 'ru');
        $ru('.lang-switch__btn').removeClass('active');
        $ru(`.lang-switch a[href^="/ru/${page}/"]`).addClass('active');
        localizeLinks($ru, 'ru');
        fs.writeFileSync(path.join(__dirname, 'ru', page, 'index.html'), $ru.html());
        console.log(`Generated RU subpage: /ru/${page}/index.html`);

        // 3. Generate EN subpage: /en/page/index.html
        fs.mkdirSync(path.join(__dirname, 'en', page), { recursive: true });
        const $en = compilePage(baseHtml, 'en');
        $en('.lang-switch__btn').removeClass('active');
        $en(`.lang-switch a[href^="/en/${page}/"]`).addClass('active');
        localizeLinks($en, 'en');
        fs.writeFileSync(path.join(__dirname, 'en', page, 'index.html'), $en.html());
        console.log(`Generated EN subpage: /en/${page}/index.html`);
    });
}

// Build all
generateMainLangs();
generateSubpages();
