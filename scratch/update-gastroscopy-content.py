import re

# 1. Prepare new HTML content for gastroscopy.html
new_content_html = """        <!-- Table of Contents / Путівник по питанням -->
        <div class="toc-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; margin-bottom: 32px; box-shadow: var(--shadow-sm);">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 1.25rem; font-weight: 600; display: flex; align-items: center; gap: 8px;" data-i18n="service.gastro.toc.title">
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
              <a href="#why-important" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.gastro.toc.item1">
                1. Чому правильна підготовка важлива?
              </a>
            </li>
            <li>
              <a href="#diet-1-day" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.gastro.toc.item2">
                2. Рекомендації за 1 день до обстеження
              </a>
            </li>
            <li>
              <a href="#day-of-exam" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.gastro.toc.item3">
                3. Що робити в день гастроскопії?
              </a>
            </li>
            <li>
              <a href="#medication" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.gastro.toc.item4">
                4. Якщо ви постійно приймаєте ліки
              </a>
            </li>
            <li>
              <a href="#sedation" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.gastro.toc.item5">
                5. Якщо гастроскопія під седацією (уві сні)
              </a>
            </li>
            <li>
              <a href="#before-exam" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.gastro.toc.item6">
                6. Що взяти з собою та як одягнутися?
              </a>
            </li>
          </ul>
        </div>

        <!-- Section 1: Why Important -->
        <div id="why-important" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.gastro.why.title">1. Чому правильна підготовка важлива?</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.gastro.why.p1">
            <strong>Гастроскопія (ВГДС)</strong> — це точний метод обстеження стравоходу, шлунка та дванадцятипалої кишки. Щоб лікар зміг детально оглянути слизову оболонку, виявити навіть дрібні запалення, виразки, поліпи чи ранні форми раку, шлунок має бути абсолютно порожнім.
          </p>
          <p style="margin-bottom: 16px;" data-i18n="service.gastro.why.p2">
            Навіть невелика кількість їжі або рідини в шлунку може значно погіршити огляд слизової оболонки, збільшити ризик виникнення блювотного рефлексу під час процедури та ускладнити точну діагностику.
          </p>
        </div>

        <!-- Section 2: 1 Day Before -->
        <div id="diet-1-day" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.gastro.diet1.title">2. Рекомендації за 1 день до обстеження</h3>
          <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 20px;">
            <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
              <li style="margin-bottom: 10px;" data-i18n="service.gastro.diet1.li1">Харчуйтеся у звичному режимі, але уникайте переїдання та важкої їжі.</li>
              <li style="margin-bottom: 10px;" data-i18n="service.gastro.diet1.li2">Останній легкий прийом їжі — не пізніше <strong>19:00–20:00</strong> (якщо дослідження заплановане на ранок).</li>
              <li style="color: #ef4444; font-weight: 500;" data-i18n="service.gastro.diet1.li3">Категорично не вживайте алкоголь напередодні процедури.</li>
            </ul>
          </div>
        </div>

        <!-- Section 3: Day of Exam -->
        <div id="day-of-exam" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.gastro.day.title">3. Що робити в день гастроскопії?</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; min-width: 0;">
            <div style="background: rgba(99, 102, 241, 0.04); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 8px; padding: 20px;">
              <h4 style="margin-top: 0; margin-bottom: 12px; color: var(--color-primary-light); font-weight: 600;" data-i18n="service.gastro.day.morning_title">Якщо обстеження вранці:</h4>
              <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
                <li style="margin-bottom: 8px;" data-i18n="service.gastro.day.morning_li1">Не їжте щонайменше <strong>6–8 годин</strong> до процедури.</li>
                <li style="margin-bottom: 8px;" data-i18n="service.gastro.day.morning_li2">Не пийте молоко, каву, соки або газовані напої.</li>
                <li data-i18n="service.gastro.day.morning_li3">Чисту негазовану воду можна пити невеликими ковтками не пізніше ніж за <strong>2 години</strong> до початку процедури.</li>
              </ul>
            </div>
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 20px;">
              <h4 style="margin-top: 0; margin-bottom: 12px; color: var(--color-text-light); font-weight: 600;" data-i18n="service.gastro.day.afternoon_title">Якщо гастроскопія після обіду:</h4>
              <p style="margin: 0;" data-i18n="service.gastro.day.afternoon_p">
                Дозволяється легкий сніданок не пізніше ніж за <strong>6–8 годин</strong> до обстеження. Будь-який подальший прийом їжі після цього суворо заборонений.
              </p>
            </div>
          </div>
        </div>

        <!-- Section 4: Medications -->
        <div id="medication" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.gastro.med.title">4. Якщо ви постійно приймаєте ліки</h3>
          <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
            <li style="margin-bottom: 10px;" data-i18n="service.gastro.med.li1">Препарати від артеріального тиску та більшості серцевих захворювань можна прийняти вранці у звичному режимі, запивши мінімальною кількістю чистої води.</li>
            <li style="margin-bottom: 10px;" data-i18n="service.gastro.med.li2">Якщо ви приймаєте інсулін, цукрознижувальні препарати або засоби, що розріджують кров (антикоагулянти), обов’язково повідомте про це лікаря заздалегідь.</li>
            <li style="font-weight: 500;" data-i18n="service.gastro.med.li3">Може знадобитися тимчасова корекція схеми прийому або скасування деяких ліків за погодженням з лікарем.</li>
          </ul>
        </div>

        <!-- Section 5: Sedation -->
        <div id="sedation" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.gastro.sedation.title">5. Якщо гастроскопія проводиться під седацією (уві сні)</h3>
          <div style="background: rgba(16, 185, 129, 0.04); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 8px; padding: 20px;">
            <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
              <li style="margin-bottom: 10px;" data-i18n="service.gastro.sedation.li1">Не їжте щонайменше <strong>6–8 годин</strong> до початку процедури.</li>
              <li style="margin-bottom: 10px;" data-i18n="service.gastro.sedation.li2">Не пийте жодної рідини протягом останніх <strong>2 годин</strong> до процедури.</li>
              <li style="color: #ef4444; font-weight: 500;" data-i18n="service.gastro.sedation.li3">Увага! Після седації категорично заборонено керувати автомобілем протягом доби. Будь ласка, заздалегідь подбайте про супровід додому.</li>
            </ul>
          </div>
        </div>

        <!-- Section 6: Before Exam -->
        <div id="before-exam" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.gastro.before.title">6. Що взяти з собою та як одягнутися?</h3>
          <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
            <li style="margin-bottom: 10px;" data-i18n="service.gastro.before.li1">Візьміть із собою результати попередніх гастроскопій, біопсій та інших медичних обстежень (за наявності), щоб лікар міг оцінити динаміку.</li>
            <li style="margin-bottom: 10px;" data-i18n="service.gastro.before.li2">Якщо ви носите знімні зубні протези — їх необхідно буде зняти безпосередньо перед дослідженням.</li>
            <li data-i18n="service.gastro.before.li3">Одягніть зручний, вільний одяг, який не стискає шию, грудну клітку та живіт.</li>
          </ul>
        </div>

        <div style="margin-top: 40px; text-align: center;">
          <a href="/#appointment-section" class="btn btn--primary open-booking-modal" data-i18n="service.gastro.btn">Записатися на гастроскопію</a>
        </div>"""

with open('gastroscopy.html', 'r', encoding='utf-8') as f:
    orig_html = f.read()

card_pattern = r'(<div class="card"[^>]*>)(.*?)(</div>\s*</div>\s*</section>)'

content_to_replace = re.search(card_pattern, orig_html, re.DOTALL)
if content_to_replace:
    orig_card_open = content_to_replace.group(1)
    orig_card_close = content_to_replace.group(3)
    modified_html = orig_html.replace(content_to_replace.group(0), f"{orig_card_open}\n{new_content_html}\n{orig_card_close}")
    with open('gastroscopy.html', 'w', encoding='utf-8') as f:
        f.write(modified_html)
    print("gastroscopy.html content updated successfully.")
else:
    print("Could not find the card content to replace in gastroscopy.html.")
