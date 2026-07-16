import re

# 1. Prepare new HTML content for colonoscopy.html
new_content_html = """        <!-- Table of Contents / Путівник по питанням -->
        <div class="toc-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; margin-bottom: 32px; box-shadow: var(--shadow-sm);">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 1.25rem; font-weight: 600; display: flex; align-items: center; gap: 8px;" data-i18n="service.colono.toc.title">
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
              <a href="#why-important" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.colono.toc.item1">
                1. Чому колоноскопія важлива та що це таке?
              </a>
            </li>
            <li>
              <a href="#diet-3-days" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.colono.toc.item2">
                2. Безшлакова дієта за 3 дні до обстеження
              </a>
            </li>
            <li>
              <a href="#diet-1-day" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.colono.toc.item3">
                3. Що можна їсти та пити напередодні?
              </a>
            </li>
            <li>
              <a href="#eziclen-schedule" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.colono.toc.item4">
                4. Схема прийому препарату Ізіклін (двоетапна)
              </a>
            </li>
            <li>
              <a href="#important-tips" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.colono.toc.item5">
                5. Важливі рекомендації під час підготовки
              </a>
            </li>
            <li>
              <a href="#video-guide" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'" data-i18n="service.colono.toc.item6">
                6. Відеоінструкція з підготовки
              </a>
            </li>
          </ul>
        </div>

        <!-- Section 1: Why Important -->
        <div id="why-important" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.colono.why.title">1. Чому колоноскопія важлива та що це таке?</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.colono.why.p1">
            <strong>Відеоколоноскопія (ФКС)</strong> — це високоточний ендоскопічний метод дослідження, який дозволяє лікарю детально оглянути слизову оболонку товстої кишки зсередини за допомогою спеціального гнучкого зонда (колоноскопа).
          </p>
          <p style="margin-bottom: 16px;" data-i18n="service.colono.why.p2">
            Добре очищений кишечник дозволяє лікарю уважно оглянути слизову оболонку, виявити навіть невеликі поліпи або ранні форми раку товстої кишки та, за необхідності, одразу їх видалити. Якісна підготовка значно підвищує точність колоноскопії та може позбавити необхідності повторного обстеження.
          </p>
        </div>

        <!-- Section 2: Diet 3 Days -->
        <div id="diet-3-days" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.colono.diet3.title">2. Безшлакова дієта за 3 дні до обстеження</h3>
          <p style="margin-bottom: 20px;" data-i18n="service.colono.diet3.p1">За 3 дні до колоноскопії рекомендується перейти на безшлакову дієту.</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; min-width: 0;">
            <div style="background: rgba(16, 185, 129, 0.04); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 8px; padding: 20px;">
              <h4 style="margin-top: 0; margin-bottom: 12px; color: #10b981; font-weight: 600;" data-i18n="service.colono.diet3.allowed_title">Можна вживати:</h4>
              <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
                <li data-i18n="service.colono.diet3.allowed_li1">відварене м’ясо та рибу;</li>
                <li data-i18n="service.colono.diet3.allowed_li2">яйця;</li>
                <li data-i18n="service.colono.diet3.allowed_li3">білий хліб або тости;</li>
                <li data-i18n="service.colono.diet3.allowed_li4">рис, манну кашу;</li>
                <li data-i18n="service.colono.diet3.allowed_li5">кисломолочні продукти без добавок;</li>
                <li data-i18n="service.colono.diet3.allowed_li6">прозорі бульйони.</li>
              </ul>
            </div>
            <div style="background: rgba(239, 68, 68, 0.04); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 8px; padding: 20px;">
              <h4 style="margin-top: 0; margin-bottom: 12px; color: #ef4444; font-weight: 600;" data-i18n="service.colono.diet3.forbidden_title">Не можна:</h4>
              <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
                <li data-i18n="service.colono.diet3.forbidden_li1">овочі та фрукти;</li>
                <li data-i18n="service.colono.diet3.forbidden_li2">ягоди;</li>
                <li data-i18n="service.colono.diet3.forbidden_li3">зелень, гриби, горіхи;</li>
                <li data-i18n="service.colono.diet3.forbidden_li4">насіння, бобові;</li>
                <li data-i18n="service.colono.diet3.forbidden_li5">чорний хліб;</li>
                <li data-i18n="service.colono.diet3.forbidden_li6">каші з цільного зерна.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Section 3: Diet 1 Day -->
        <div id="diet-1-day" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.colono.diet1.title">3. Що можна їсти та пити напередодні?</h3>
          <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 20px; margin-bottom: 16px;">
            <h4 style="margin-top: 0; margin-bottom: 12px; color: var(--color-primary-light); font-weight: 600;" data-i18n="service.colono.diet1.allowed_title">Дозволяються лише прозорі рідини:</h4>
            <ul style="margin: 0 0 16px 0; padding-left: 20px; list-style-type: disc;">
              <li data-i18n="service.colono.diet1.allowed_li1">вода, неміцний чай;</li>
              <li data-i18n="service.colono.diet1.allowed_li2">прозорий бульйон;</li>
              <li data-i18n="service.colono.diet1.allowed_li3">яблучний сік без м’якоті;</li>
              <li data-i18n="service.colono.diet1.allowed_li4">прозорі спортивні напої.</li>
            </ul>
            <p style="margin: 0; color: #ef4444; font-weight: 500;" data-i18n="service.colono.diet1.forbidden_p">Молоко, кефір, соки з м’якоттю та алкоголь вживати не можна.</p>
          </div>
        </div>

        <!-- Section 4: Eziclen Intake Schedule -->
        <div id="eziclen-schedule" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.colono.prep.title">4. Схема прийому препарату Ізіклін</h3>
          <p style="margin-bottom: 20px;" data-i18n="service.colono.prep.p1">Найкращий результат забезпечує двоетапна (split-dose) схема підготовки.</p>

          <div style="background: rgba(99, 102, 241, 0.04); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; margin-bottom: 12px; color: var(--color-primary-light); font-weight: 600;" data-i18n="service.colono.prep.morning_title">Якщо колоноскопія призначена на ранок</h4>
            <ul style="margin: 0 0 16px 0; padding-left: 20px; list-style-type: decimal;">
              <li style="margin-bottom: 8px;" data-i18n="service.colono.prep.morning_li1"><strong>Увечері напередодні (18:00–20:00):</strong> випийте першу дозу Ізікліну відповідно до інструкції, після чого випийте приблизно 1 літр прозорої рідини.</li>
              <li data-i18n="service.colono.prep.morning_li2"><strong>Вранці в день обстеження (за 4–5 годин до процедури):</strong> прийміть другу дозу препарату, після чого знову випийте 1 літр прозорої рідини.</li>
            </ul>
            <p style="margin: 0; font-weight: 500; color: var(--color-text-light);" data-i18n="service.colono.prep.morning_p">Усі рідини необхідно завершити приймати не пізніше ніж за 2 години до седації або процедури (якщо лікар не дав інших рекомендацій).</p>
          </div>

          <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 20px;">
            <h4 style="margin-top: 0; margin-bottom: 12px; color: var(--color-text-light); font-weight: 600;" data-i18n="service.colono.prep.afternoon_title">If colonoscopy is in the afternoon / Якщо колоноскопія після обіду</h4>
            <p style="margin: 0;" data-i18n="service.colono.prep.afternoon_p">Першу дозу можна прийняти вранці, а другу — через кілька годин, дотримуючись рекомендацій вашого лікаря.</p>
          </div>
        </div>

        <!-- Section 5: Important Tips -->
        <div id="important-tips" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.colono.tips.title">5. Важливі рекомендації під час підготовки</h3>
          <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
            <li style="margin-bottom: 10px;" data-i18n="service.colono.tips.li1">Під час підготовки пийте достатню кількість рідини, щоб уникнути зневоднення.</li>
            <li style="margin-bottom: 10px;" data-i18n="service.colono.tips.li2">Якщо ви постійно приймаєте препарати для розрідження крові, цукрознижувальні засоби або інсулін, обов’язково повідомте про це лікаря заздалегідь.</li>
            <li data-i18n="service.colono.tips.li3">При сильній нудоті або блюванні зверніться до медичного персоналу.</li>
          </ul>
        </div>

        <!-- Section 6: Video Guide -->
        <div id="video-guide" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);" data-i18n="service.colono.video.title">6. Відеоінструкція з підготовки</h3>
          <p style="margin-bottom: 16px;" data-i18n="service.colono.video.desc">Перегляньте детальне відео про те, як правильно підготуватися до ендоскопічного дослідження:</p>
          
          <div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 12px; margin-top: 20px; box-shadow: var(--shadow-md);">
            <!-- Placeholder YouTube Embed - Rick Roll. Replace with actual doctor's URL or similar -->
            <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </div>

        <div style="margin-top: 40px; text-align: center;">
          <a href="/#appointment-section" class="btn btn--primary open-booking-modal" data-i18n="service.colono.btn">Записатися на колоноскопію</a>
        </div>"""

with open('colonoscopy.html', 'r', encoding='utf-8') as f:
    orig_html = f.read()

# Replace the content within the container
# Find everything between <div class="card"...> and </div> before <!-- ============================================================ FOOTER -->
# Let's search card and replace it.
card_pattern = r'(<div class="card"[^>]*>)(.*?)(</div>\s*</div>\s*</section>)'

# We need to preserve the wrapper. Let's make sure
content_to_replace = re.search(card_pattern, orig_html, re.DOTALL)
if content_to_replace:
    orig_card_open = content_to_replace.group(1)
    orig_card_close = content_to_replace.group(3)
    modified_html = orig_html.replace(content_to_replace.group(0), f"{orig_card_open}\n{new_content_html}\n{orig_card_close}")
    with open('colonoscopy.html', 'w', encoding='utf-8') as f:
        f.write(modified_html)
    print("colonoscopy.html content updated successfully.")
else:
    print("Could not find the card content to replace in colonoscopy.html.")
