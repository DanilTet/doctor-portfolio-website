import re
import os

def update_html_content(filepath, is_ru):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Title and Subtitle
    if is_ru:
        html = re.sub(r'<h1.*?data-i18n="service.ercp.title".*?>.*?</h1>', r'<h1 class="section-title" style="text-align: left; margin-bottom: 16px; font-size: clamp(2rem, 5vw, 3.5rem);" data-i18n="service.ercp.title">ЭРХПГ (эндоскопическая ретроградная холангиопанкреатография)</h1>', html, flags=re.DOTALL)
        html = re.sub(r'<p class="section-subtitle".*?data-i18n="service.ercp.subtitle".*?>.*?</p>', r'<p class="section-subtitle" style="text-align: left; max-width: 800px;" data-i18n="service.ercp.subtitle">Высокоточная диагностика и малоинвазивное лечение заболеваний желчных протоков без разрезов.</p>', html, flags=re.DOTALL)
    else:
        html = re.sub(r'<h1.*?data-i18n="service.ercp.title".*?>.*?</h1>', r'<h1 class="section-title" style="text-align: left; margin-bottom: 16px; font-size: clamp(2rem, 5vw, 3.5rem);" data-i18n="service.ercp.title">ЕРХПГ (ендоскопічна ретроградна холангіопанкреатографія)</h1>', html, flags=re.DOTALL)
        html = re.sub(r'<p class="section-subtitle".*?data-i18n="service.ercp.subtitle".*?>.*?</p>', r'<p class="section-subtitle" style="text-align: left; max-width: 800px;" data-i18n="service.ercp.subtitle">Високоточна діагностика та малоінвазивне лікування захворювань жовчних протоків без розрізів.</p>', html, flags=re.DOTALL)

    # TOC
    toc_ru = """
    <li><a href="#about-ercp" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" data-i18n="service.ercp.toc.item1">1. Что такое ЭРХПГ?</a></li>
    <li><a href="#diag" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" data-i18n="service.ercp.toc.item2">2. Диагностическая ЭРХПГ (диагностика желчных протоков)</a></li>
    <li><a href="#treatment" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" data-i18n="service.ercp.toc.item3">3. Лечебная ЭРХПГ (эндоскопическое удаление камней)</a></li>
    <li><a href="#prep-ercp" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" data-i18n="service.ercp.toc.item4">4. Как проходит процедура и подготовка</a></li>
    <li><a href="#recovery" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" data-i18n="service.ercp.toc.item5">5. Восстановление после ЭРХПГ</a></li>
    """
    
    toc_uk = """
    <li><a href="#about-ercp" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" data-i18n="service.ercp.toc.item1">1. Що таке ЕРХПГ?</a></li>
    <li><a href="#diag" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" data-i18n="service.ercp.toc.item2">2. Діагностична ЕРХПГ (діагностика жовчних протоків)</a></li>
    <li><a href="#treatment" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" data-i18n="service.ercp.toc.item3">3. Лікувальна ЕРХПГ (ендоскопічне видалення каменів)</a></li>
    <li><a href="#prep-ercp" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" data-i18n="service.ercp.toc.item4">4. Як проходить процедура та підготовка</a></li>
    <li><a href="#recovery" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" data-i18n="service.ercp.toc.item5">5. Відновлення після ЕРХПГ</a></li>
    """
    
    html = re.sub(r'<ul style="display: flex; flex-direction: column; gap: 12px; padding-left: 0; list-style-type: none; margin: 0;">.*?</ul>', f'<ul style="display: flex; flex-direction: column; gap: 12px; padding-left: 0; list-style-type: none; margin: 0;">{toc_ru if is_ru else toc_uk}</ul>', html, flags=re.DOTALL)

    # Content replacements
    content_ru = """
        <!-- Section 1: About -->
        <div id="about-ercp" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.ercp.about.title">1. Что такое ЭРХПГ?</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.ercp.about.p1"><strong>ЭРХПГ (эндоскопическая ретроградная холангиопанкреатография)</strong> — это специализированная процедура, объединяющая эндоскопию и рентгеноскопию для диагностики и лечения заболеваний желчных и панкреатических протоков.</p>
          <p style="margin-bottom: 16px;" data-i18n="service.ercp.about.p2">С помощью специального эндоскопа врач достигает двенадцатиперстной кишки, находит место выхода желчных протоков (фатеров сосочек) и вводит контрастное вещество. Это позволяет получить четкие рентгеновские снимки протоков и при необходимости сразу выполнить лечебные манипуляции без хирургических разрезов.</p>
        </div>

        <!-- Section 2: Diagnostic -->
        <div id="diag" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.ercp.diag.title">2. Диагностическая ЭРХПГ (диагностика желчных протоков)</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.ercp.diag.p1">Диагностический этап процедуры позволяет врачу визуализировать структуру желчевыводящих путей и определить точную причину нарушения оттока желчи.</p>
          <ul style="margin-bottom: 24px; padding-left: 20px; list-style-type: disc;">
            <li style="margin-bottom: 8px;" data-i18n="service.ercp.diag.li1">Выявление камней в желчных протоках (холедохолитиаз).</li>
            <li style="margin-bottom: 8px;" data-i18n="service.ercp.diag.li2">Определение причин механической желтухи.</li>
            <li style="margin-bottom: 8px;" data-i18n="service.ercp.diag.li3">Диагностика стриктур (сужений) желчных путей.</li>
          </ul>
        </div>

        <!-- Section 3: Treatment -->
        <div id="treatment" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.ercp.treatment.title">3. Лечебная ЭРХПГ (эндоскопическое удаление камней)</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.ercp.treatment.p1">Если во время диагностики обнаруживается проблема (например, камень), врач может немедленно перейти к лечебному вмешательству — это главное преимущество ЭРХПГ.</p>
          <ul style="margin-bottom: 24px; padding-left: 20px; list-style-type: disc;">
            <li style="margin-bottom: 8px;" data-i18n="service.ercp.treatment.li1"><strong>Эндоскопическое удаление камней:</strong> извлечение конкрементов из желчных протоков специальной корзинкой или баллоном.</li>
            <li style="margin-bottom: 8px;" data-i18n="service.ercp.treatment.li2"><strong>Папиллосфинктеротомия:</strong> небольшое рассечение сосочка для облегчения выхода камней и улучшения оттока желчи.</li>
            <li style="margin-bottom: 8px;" data-i18n="service.ercp.treatment.li3"><strong>Стентирование:</strong> установка пластиковых или металлических стентов для расширения суженных участков протока.</li>
          </ul>
        </div>

        <!-- Section 4: Prep -->
        <div id="prep-ercp" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.ercp.prep.title">4. Как проходит процедура и подготовка</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.ercp.prep.p1">ЭРХПГ — это серьезное медицинское вмешательство, которое проводится в условиях стационара, как правило, под седацией (медикаментозным сном) или общей анестезией.</p>
          <div style="background: rgba(99, 102, 241, 0.04); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
              <li style="margin-bottom: 10px;" data-i18n="service.ercp.prep.li1"><strong>Строго натощак:</strong> нельзя есть минимум 8 часов и пить за 4 часа до процедуры.</li>
              <li style="margin-bottom: 10px;" data-i18n="service.ercp.prep.li2"><strong>Анализы:</strong> перед ЭРХПГ обязательно сдается клинический и биохимический анализ крови, коагулограмма, ЭКГ.</li>
              <li style="margin-bottom: 10px;" data-i18n="service.ercp.prep.li3"><strong>Лекарства:</strong> сообщите врачу обо всех принимаемых препаратах, особенно кроворазжижающих.</li>
            </ul>
          </div>
        </div>

        <!-- Section 5: Recovery -->
        <div id="recovery" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.ercp.rec.title">5. Восстановление после ЭРХПГ</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.ercp.rec.p1">После процедуры пациент остается под медицинским наблюдением в клинике. Это необходимо для контроля за состоянием после наркоза и раннего выявления возможных осложнений (таких как панкреатит).</p>
          <p style="margin-bottom: 16px;" data-i18n="service.ercp.rec.p2">В большинстве случаев выписка возможна на следующий день. Врач назначает специальную диету и, при необходимости, медикаментозное лечение.</p>
        </div>
    """

    content_uk = """
        <!-- Section 1: About -->
        <div id="about-ercp" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.ercp.about.title">1. Що таке ЕРХПГ?</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.ercp.about.p1"><strong>ЕРХПГ (ендоскопічна ретроградна холангіопанкреатографія)</strong> — це спеціалізована процедура, що поєднує ендоскопію та рентгеноскопію для діагностики і лікування захворювань жовчних та панкреатичних протоків.</p>
          <p style="margin-bottom: 16px;" data-i18n="service.ercp.about.p2">За допомогою спеціального ендоскопа лікар досягає дванадцятипалої кишки, знаходить місце виходу жовчних протоків (фатерів сосочок) і вводить контрастну речовину. Це дозволяє отримати чіткі рентгенівські знімки протоків та за необхідності одразу виконати лікувальні маніпуляції без хірургічних розрізів.</p>
        </div>

        <!-- Section 2: Diagnostic -->
        <div id="diag" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.ercp.diag.title">2. Діагностична ЕРХПГ (діагностика жовчних протоків)</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.ercp.diag.p1">Діагностичний етап процедури дозволяє лікарю візуалізувати структуру жовчовивідних шляхів і визначити точну причину порушення відтоку жовчі.</p>
          <ul style="margin-bottom: 24px; padding-left: 20px; list-style-type: disc;">
            <li style="margin-bottom: 8px;" data-i18n="service.ercp.diag.li1">Виявлення каменів у жовчних протоках (холедохолітіаз).</li>
            <li style="margin-bottom: 8px;" data-i18n="service.ercp.diag.li2">Визначення причин механічної жовтяниці.</li>
            <li style="margin-bottom: 8px;" data-i18n="service.ercp.diag.li3">Діагностика стриктур (звужень) жовчних шляхів.</li>
          </ul>
        </div>

        <!-- Section 3: Treatment -->
        <div id="treatment" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.ercp.treatment.title">3. Лікувальна ЕРХПГ (ендоскопічне видалення каменів)</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.ercp.treatment.p1">Якщо під час діагностики виявляється проблема (наприклад, камінь), лікар може негайно перейти до лікувального втручання — це головна перевага ЕРХПГ.</p>
          <ul style="margin-bottom: 24px; padding-left: 20px; list-style-type: disc;">
            <li style="margin-bottom: 8px;" data-i18n="service.ercp.treatment.li1"><strong>Ендоскопічне видалення каменів:</strong> вилучення конкрементів із жовчних протоків спеціальним кошиком або балоном.</li>
            <li style="margin-bottom: 8px;" data-i18n="service.ercp.treatment.li2"><strong>Папілосфінктеротомія:</strong> невелике розсічення сосочка для полегшення виходу каменів та покращення відтоку жовчі.</li>
            <li style="margin-bottom: 8px;" data-i18n="service.ercp.treatment.li3"><strong>Стентування:</strong> встановлення пластикових або металевих стентів для розширення звужених ділянок протоки.</li>
          </ul>
        </div>

        <!-- Section 4: Prep -->
        <div id="prep-ercp" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.ercp.prep.title">4. Як проходить процедура та підготовка</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.ercp.prep.p1">ЕРХПГ — це серйозне медичне втручання, яке проводиться в умовах стаціонару, як правило, під седацією (медикаментозним сном) або загальною анестезією.</p>
          <div style="background: rgba(99, 102, 241, 0.04); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
              <li style="margin-bottom: 10px;" data-i18n="service.ercp.prep.li1"><strong>Суворо натщесерце:</strong> не можна їсти мінімум 8 годин та пити за 4 години до процедури.</li>
              <li style="margin-bottom: 10px;" data-i18n="service.ercp.prep.li2"><strong>Аналізи:</strong> перед ЕРХПГ обов'язково здається клінічний і біохімічний аналіз крові, коагулограма, ЕКГ.</li>
              <li style="margin-bottom: 10px;" data-i18n="service.ercp.prep.li3"><strong>Ліки:</strong> повідомте лікарю про всі препарати, які приймаєте, особливо ті, що розріджують кров.</li>
            </ul>
          </div>
        </div>

        <!-- Section 5: Recovery -->
        <div id="recovery" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.ercp.rec.title">5. Відновлення після ЕРХПГ</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.ercp.rec.p1">Після процедури пацієнт залишається під медичним наглядом у клініці. Це необхідно для контролю за станом після наркозу та раннього виявлення можливих ускладнень (таких як панкреатит).</p>
          <p style="margin-bottom: 16px;" data-i18n="service.ercp.rec.p2">У більшості випадків виписка можлива наступного дня. Лікар призначає спеціальну дієту та, за необхідності, медикаментозне лікування.</p>
        </div>
    """

    # Replace everything from <div id="about-ercp"> to </div><!-- Section 5: Recovery --></div>
    html = re.sub(r'<!-- Section 1: About -->.*?</div>\s*</div>\s*(?:<div style="margin-top: 32px;|<div style="margin-top: 40px;)', f'{content_ru if is_ru else content_uk}\n\n        <div style="margin-top: 40px;', html, flags=re.DOTALL)
    
    # Also change the CTA button
    if is_ru:
        html = html.replace('data-i18n="service.ercp.btn">Получить консультацию хирурга', 'data-i18n="service.ercp.btn">Получить консультацию по ЭРХПГ')
    else:
        html = html.replace('data-i18n="service.ercp.btn">Отримати консультацію хірурга', 'data-i18n="service.ercp.btn">Отримати консультацію щодо ЕРХПГ')
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

base = 'c:/oleg-site/doctor-portfolio-website'
update_html_content(f'{base}/ercp/index.html', False)
update_html_content(f'{base}/ru/ercp/index.html', True)
print("ERCP content injected.")
