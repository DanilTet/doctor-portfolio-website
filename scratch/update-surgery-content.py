import re

new_content_html = """        <!-- Table of Contents / Путівник по питанням -->
        <div class="toc-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; margin-bottom: 32px; box-shadow: var(--shadow-sm);">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 1.25rem; font-weight: 600; display: flex; align-items: center; gap: 8px;" data-i18n="service.surgery.toc.title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Путівник з підготовки та проведення:
          </h3>
          <ul style="display: flex; flex-direction: column; gap: 12px; padding-left: 0; list-style-type: none; margin: 0;">
            <li>
              <a href="#about-surgery" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.surgery.toc.item1">
                1. Що таке оперативна ендоскопія?
              </a>
            </li>
            <li>
              <a href="#operations" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.surgery.toc.item2">
                2. Які операції виконуються ендоскопічно?
              </a>
            </li>
            <li>
              <a href="#polypectomy" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.surgery.toc.item3">
                3. Як проходить видалення поліпів (поліпектомія)?
              </a>
            </li>
            <li>
              <a href="#prep-surgery" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.surgery.toc.item4">
                4. Як підготуватися до ендоскопічної операції?
              </a>
            </li>
            <li>
              <a href="#recovery" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.surgery.toc.item5">
                5. Переваги та період відновлення
              </a>
            </li>
          </ul>
        </div>

        <!-- Section 1: About -->
        <div id="about-surgery" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.surgery.about.title">1. Що таке оперативна ендоскопія?</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.surgery.about.p1">
            <strong>Оперативна ендоскопія</strong> — це передовий напрямок малоінвазивної хірургії. Він дозволяє виконувати повноцінні хірургічні втручання всередині порожнистих органів (стравоходу, шлунка, кишечника) через природні отвори за допомогою гнучких ендоскопів та спеціальних мікроінструментів.
          </p>
          <p style="margin-bottom: 16px;" data-i18n="service.surgery.about.p2">
            Головна відмінність від класичної хірургії — повна відсутність розрізів на шкірі (черевної стінки). Лікар контролює весь процес на екрані монітора з багаторазовим оптичним збільшенням, що гарантує високу точність та безпеку втручання.
          </p>
        </div>

        <!-- Section 2: Operations -->
        <div id="operations" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.surgery.ops.title">2. Які операції виконуються ендоскопічно?</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.surgery.ops.p1">У сучасній ендоскопічній практиці виконується широкий спектр лікувальних процедур:</p>
          <ul style="margin-bottom: 24px; padding-left: 20px; list-style-type: disc;">
            <li style="margin-bottom: 8px;" data-i18n="service.surgery.ops.li1"><strong>Поліпектомія:</strong> видалення доброякісних утворень (поліпів) у шлунку, дванадцятипалій та товстій кишці для профілактики онкології.</li>
            <li style="margin-bottom: 8px;" data-i18n="service.surgery.ops.li2"><strong>Зупинка кровотеч:</strong> коагуляція судин або кліпування при гострих шлунково-кишкових кровотечах (наприклад, при виразці).</li>
            <li style="margin-bottom: 8px;" data-i18n="service.surgery.ops.li3"><strong>Видалення сторонніх тіл:</strong> безпечне вилучення предметів, які випадково потрапили до стравоходу чи шлунка.</li>
            <li data-i18n="service.surgery.ops.li4"><strong>Бужування та розширення:</strong> відновлення прохідності звужених ділянок стравоходу.</li>
          </ul>
        </div>

        <!-- Section 3: Polypectomy -->
        <div id="polypectomy" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.surgery.poly.title">3. Як проходить видалення поліпів (поліпектомія)?</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.surgery.poly.p1">
            Видалення поліпів виконується безболісно під час діагностичного огляду (гастроскопії або колоноскопії) у стані <strong>медикаментозного сну (седації)</strong>.
          </p>
          <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 20px; margin-bottom: 16px;">
            <p style="margin: 0;" data-i18n="service.surgery.poly.p2">
              На ніжку поліпа накидається спеціальна металева петля, через яку пропускається струм високої частоти. Поліп зрізається, а судина в його основі відразу коагулюється (припікається), що запобігає виникненню кровотечі. Усі видалені тканини обов'язково направляються на <strong>гістологічне дослідження</strong>.
            </p>
          </div>
        </div>

        <!-- Section 4: Prep -->
        <div id="prep-surgery" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.surgery.prep.title">4. Як підготуватися до ендоскопічної операції?</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.surgery.prep.p1">Підготовка залежить від того, на якому органі виконуватиметься операція, та здійснюється за тими самими правилами, що й для діагностичного огляду:</p>
          <div style="background: rgba(99, 102, 241, 0.04); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
              <li style="margin-bottom: 10px;" data-i18n="service.surgery.prep.li1"><strong>Шлунок (ВГДС-операції):</strong> строго натщесерце (не їсти 6-8 годин, не пити рідини за 2 години до седації).</li>
              <li style="margin-bottom: 10px;" data-i18n="service.surgery.prep.li2"><strong>Товстий кишечник (КС-операції):</strong> дотримання безшлакової дієти протягом 3 днів та повне очищення препаратом Ізіклін за схемою.</li>
              <li style="margin-bottom: 10px;" data-i18n="service.surgery.prep.li3"><strong>Аналізи:</strong> перед плановим хірургічним втручанням необхідно здати стандартний перелік аналізів крові (клінічний, коагулограму, групу крові) та зробити ЕКГ.</li>
              <li style="font-weight: 500;" data-i18n="service.surgery.prep.li4"><strong>Ліки:</strong> якщо ви постійно приймаєте антикоагулянти (препарати, що розріджують кров), обов’язково обговоріть це з хірургом заздалегідь — деякі з них необхідно тимчасово відмінити за кілька днів до операції.</li>
            </ul>
          </div>
        </div>

        <!-- Section 5: Recovery -->
        <div id="recovery" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.surgery.rec.title">5. Переваги та період відновлення</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.surgery.rec.p1">
            Малоінвазивний характер операції забезпечує відсутність болю у післяопераційному періоді та швидку реабілітацію. Більшість пацієнтів відпускають додому вже за кілька годин після операції.
          </p>
          <p style="margin-bottom: 16px;" data-i18n="service.surgery.rec.p2">
            Рекомендується дотримуватися щадної дієти та виключити важкі фізичні навантаження, гарячу ванну та лазню протягом 5-7 днів після втручання.
          </p>
        </div>

        <div style="margin-top: 40px; text-align: center;">
          <a href="/#appointment-section" class="btn btn--primary open-booking-modal" data-i18n="service.surgery.btn">Отримати консультацію хірурга</a>
        </div>"""

with open('surgery.html', 'r', encoding='utf-8') as f:
    orig_html = f.read()

card_pattern = r'(<div class="card"[^>]*>)(.*?)(</div>\s*</div>\s*</section>)'

content_to_replace = re.search(card_pattern, orig_html, re.DOTALL)
if content_to_replace:
    orig_card_open = content_to_replace.group(1)
    orig_card_close = content_to_replace.group(3)
    modified_html = orig_html.replace(content_to_replace.group(0), f"{orig_card_open}\n{new_content_html}\n{orig_card_close}")
    with open('surgery.html', 'w', encoding='utf-8') as f:
        f.write(modified_html)
    print("surgery.html content updated successfully.")
else:
    print("Could not find the card content to replace in surgery.html.")
