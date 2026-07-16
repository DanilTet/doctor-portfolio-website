import re

new_content_html = """        <!-- Table of Contents / Путівник по питанням -->
        <div class="toc-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; margin-bottom: 32px; box-shadow: var(--shadow-sm);">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 1.25rem; font-weight: 600; display: flex; align-items: center; gap: 8px;" data-i18n="service.uzd.toc.title">
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
              <a href="#about-uzd" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.uzd.toc.item1">
                1. Що таке УЗД та як воно працює?
              </a>
            </li>
            <li>
              <a href="#organs" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.uzd.toc.item2">
                2. Які органи можна обстежити за допомогою УЗД?
              </a>
            </li>
            <li>
              <a href="#prep-abdominal" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.uzd.toc.item3">
                3. Як правильно підготуватися до УЗД черевної порожнини?
              </a>
            </li>
            <li>
              <a href="#prep-urinary" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.uzd.toc.item4">
                4. Підготовка до УЗД нирок та сечового міхура
              </a>
            </li>
            <li>
              <a href="#advantages" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.uzd.toc.item5">
                5. Які переваги УЗД та коли воно необхідне?
              </a>
            </li>
          </ul>
        </div>

        <!-- Section 1: About -->
        <div id="about-uzd" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.uzd.about.title">1. Що таке УЗД та як воно працює?</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.uzd.about.p1">
            <strong>Ультразвукова діагностика (УЗД)</strong> — це неінвазивний, швидкий та повністю безпечний метод дослідження. Він базується на використанні високочастотних звукових хвиль, які відбиваються від тканин організму та формують чітке зображення внутрішніх органів на екрані сканера у реальному часі.
          </p>
          <p style="margin-bottom: 16px;" data-i18n="service.uzd.about.p2">
            Оскільки УЗД не використовує іонізуюче (рентгенівське) випромінювання, воно є абсолютно нешкідливим. Обстеження можна проводити багаторазово пацієнтам будь-якого віку, зокрема дітям та вагітним жінкам, для оцінки форми, розмірів, структури органів та кровотоку в них.
          </p>
        </div>

        <!-- Section 2: Organs -->
        <div id="organs" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.uzd.organs.title">2. Які органи можна обстежити за допомогою УЗД?</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.uzd.organs.p1">УЗД дозволяє виявити запалення, новоутворення, камені у жовчному міхурі чи нирках на ранніх етапах:</p>
          <ul style="margin-bottom: 24px; padding-left: 20px; list-style-type: disc;">
            <li style="margin-bottom: 8px;" data-i18n="service.uzd.organs.li1"><strong>Органи черевної порожнини:</strong> детальний огляд печінки, жовчного міхура, підшлункової залози та селезінки.</li>
            <li style="margin-bottom: 8px;" data-i18n="service.uzd.organs.li2"><strong>Сечовидільна система:</strong> нирки, надниркові залози, сечовий міхур.</li>
            <li style="margin-bottom: 8px;" data-i18n="service.uzd.organs.li3"><strong>Ендокринна система:</strong> щитоподібна залоза.</li>
            <li data-i18n="service.uzd.organs.li4"><strong>М'які тканини та лімфовузли:</strong> діагностика поверхневих структур та периферичних лімфатичних вузлів.</li>
          </ul>
        </div>

        <!-- Section 3: Abdominal Prep -->
        <div id="prep-abdominal" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.uzd.prep_ab.title">3. Як правильно підготуватися до УЗД черевної порожнини?</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.uzd.prep_ab.p1">
            Якість обстеження черевної порожнини залежить від кількості газів у кишечнику (газ створює перешкоди для ультразвуку). Тому підготовка вкрай важлива:
          </p>
          
          <div style="background: rgba(99, 102, 241, 0.04); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
              <li style="margin-bottom: 10px;" data-i18n="service.uzd.prep_ab.li1"><strong>За 2-3 дні до дослідження:</strong> виключіть продукти, що посилюють газоутворення (бобові, свіжі овочі та фрукти, капусту, чорний хліб, молоко, солодкі газовані напої).</li>
              <li style="margin-bottom: 10px;" data-i18n="service.uzd.prep_ab.li2">При схильності до метеоризму за рекомендацією лікаря протягом цих днів можна приймати вітрогонні препарати (наприклад, симетикон / еспумізан).</li>
              <li style="margin-bottom: 10px;" data-i18n="service.uzd.prep_ab.li3"><strong>У день дослідження:</strong> процедура проводиться суворо <strong>натщесерце</strong> (останній прийом їжі — мінімум за 6–8 годин). Перед процедурою не слід палити та жувати гумку.</li>
              <li data-i18n="service.uzd.prep_ab.li4">Якщо обстеження призначене на другу половину дня, можливий легкий сніданок не пізніше ніж за 6 годин до процедури, після чого їсти заборонено.</li>
            </ul>
          </div>
        </div>

        <!-- Section 4: Urinary Prep -->
        <div id="prep-urinary" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.uzd.prep_ur.title">4. Підготовка до УЗД нирок та сечового міхура</h3>
          <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 20px;">
            <p style="margin-top: 0; margin-bottom: 16px;" data-i18n="service.uzd.prep_ur.p1">
              Для якісного огляду стінок сечового міхура та прилеглих структур він має бути добре заповнений:
            </p>
            <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
              <li style="margin-bottom: 10px;" data-i18n="service.uzd.prep_ur.li1">Приблизно за 1–1.5 години до запланованого дослідження випийте 1 літр чистої негазованої води або компоту (без газу).</li>
              <li data-i18n="service.uzd.prep_ur.li2">Після цього не слід відвідувати туалет до завершення процедури обстеження.</li>
            </ul>
          </div>
        </div>

        <!-- Section 5: Advantages -->
        <div id="advantages" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.uzd.adv.title">5. Які переваги УЗД та коли воно необхідне?</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.uzd.adv.p1">
            УЗД є первинним інструментом скринінгу завдяки швидкості виконання та високій інформативності. Лікарі призначають його при болях у животі, порушеннях травлення, дискомфорті при сечовипусканні, появі припухлостей у м'яких тканинах чи відхиленнях у лабораторних аналізах.
          </p>
          <p style="margin-bottom: 16px;" data-i18n="service.uzd.adv.p2">
            Дослідження дозволяє швидко встановити попередній діагноз і визначити подальшу тактику обстеження чи терапії, не змушуючи пацієнта чекати.
          </p>
        </div>

        <div style="margin-top: 40px; text-align: center;">
          <a href="/#appointment-section" class="btn btn--primary open-booking-modal" data-i18n="service.uzd.btn">Записатися на УЗД</a>
        </div>"""

with open('uzd.html', 'r', encoding='utf-8') as f:
    orig_html = f.read()

card_pattern = r'(<div class="card"[^>]*>)(.*?)(</div>\s*</div>\s*</section>)'

content_to_replace = re.search(card_pattern, orig_html, re.DOTALL)
if content_to_replace:
    orig_card_open = content_to_replace.group(1)
    orig_card_close = content_to_replace.group(3)
    modified_html = orig_html.replace(content_to_replace.group(0), f"{orig_card_open}\n{new_content_html}\n{orig_card_close}")
    with open('uzd.html', 'w', encoding='utf-8') as f:
        f.write(modified_html)
    print("uzd.html content updated successfully.")
else:
    print("Could not find the card content to replace in uzd.html.")
