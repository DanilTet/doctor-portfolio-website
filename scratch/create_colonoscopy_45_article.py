import os
import sys

sys.path.append(os.getcwd())
from scratch.generate_articles import generate_html

base_dir = os.getcwd()

article_ids = ["kolonoskopiya-45", "age-colonoscopy"]

uk_title = "45 років — час виконати першу колоноскопію | Скринінг"
uk_meta = "Чому у віці 45 років варто пройти першу профілактичну колоноскопію. Безболісно та безпечно у 17-й лікарні м. Харків."
uk_h1 = "45 років — час виконати першу колоноскопію"
uk_sub = "Якщо вам виповнилося 45 років і вас нічого не турбує — це саме той момент, коли варто пройти першу профілактичну колоноскопію."
uk_toc = """
    <li><a href="#section-1" class="toc-link">Чому саме 45 років — золотий стандарт скринінгу?</a></li>
    <li><a href="#section-2" class="toc-link">Безсимптомний перебіг поліпів і раку кишківника</a></li>
    <li><a href="#section-3" class="toc-link">Як проходить процедура у 17-й лікарні м. Харків</a></li>
    <li><a href="#section-4" class="toc-link">Медикаментозний сон та використання газу CO2</a></li>
    <li><a href="#section-5" class="toc-link">Як записатися на консультацію або огляд</a></li>
"""

uk_content = """
<h3 id="section-1" style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Чому саме 45 років — золотий стандарт скринінгу?</h3>
<p style="margin-bottom: 16px;">Якщо вам виповнилося 45 років і вас нічого не турбує — це саме той момент, коли варто пройти першу профілактичну колоноскопію. Згідно з рекомендаціями провідних світових асоціацій (ASGE, ESGE), саме у віці 45 років починається плановий скринінг колоректального раку для всіх людей із середнім ризиком.</p>

<h3 id="section-2" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Безсимптомний перебіг поліпів і раку кишківника</h3>
<p style="margin-bottom: 16px;">Більшість поліпів і ранніх форм раку товстої кишки тривалий час не викликають жодних симптомів. Вони не болять, не спричиняють дискомфорту чи кровотеч. Скринінгове обстеження дозволяє виявити ці зміни на ранній стадії або навіть повністю запобігти розвитку захворювання, видаливши поліпи безболісно безпосередньо під час процедури.</p>

<h3 id="section-3" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Як проходить процедура у 17-й міській лікарні м. Харків</h3>
<p style="margin-bottom: 16px;">У 17-й міській лікарні обстеження проводиться на сучасному експертному відеоендоскопічному обладнанні лікарем-ендоскопістом вищої категорії Тетерніком Олексієм Олексійовичем.</p>

<h3 id="section-4" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Медикаментозний сон та використання газу CO2</h3>
<p style="margin-bottom: 16px;">Щоб ви не відчували жодного болю, страху чи дискомфорту, колоноскопія виконується в умовах медикаментозного сну (комфортної седації). Ви просто засинаєте на 15–20 хвилин, а коли прокидаєтеся — процедура вже успішно завершена.</p>
<p style="margin-bottom: 16px;">Для розширення просвіту кишки ми використовуємо медичний газ CO2, який миттєво всмоктується тканинами та не викликає здуття чи болю після огляду.</p>

<h3 id="section-5" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Як записатися на консультацію або огляд</h3>
<p style="margin-bottom: 16px;">Не чекайте появи скарг. Подбайте про своє здоров’я вчасно — профілактика завжди ефективніша та простіша за лікування.</p>
"""

ru_title = "45 лет — время выполнить первую колоноскопию | Скрининг"
ru_meta = "Почему в возрасте 45 лет важно пройти первую профилактическую колоноскопию. Безболезненно и безопасно в 17-й больнице г. Харьков."
ru_h1 = "45 лет — время выполнить первую колоноскопию"
ru_sub = "Если вам исполнилось 45 лет и вас ничего не беспокоит — это именно тот момент, когда стоит пройти первую профилактическую колоноскопию."
ru_toc = """
    <li><a href="#section-1" class="toc-link">Почему именно 45 лет — золотой стандарт скрининга?</a></li>
    <li><a href="#section-2" class="toc-link">Бессимптомное течение полипов и рака кишечника</a></li>
    <li><a href="#section-3" class="toc-link">Как проходит процедура в 17-й больнице г. Харьков</a></li>
    <li><a href="#section-4" class="toc-link">Медикаментозный сон и использование газа CO2</a></li>
    <li><a href="#section-5" class="toc-link">Как записаться на консультацию или обследование</a></li>
"""

ru_content = """
<h3 id="section-1" style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Почему именно 45 лет — золотой стандарт скрининга?</h3>
<p style="margin-bottom: 16px;">Если вам исполнилось 45 лет и вас ничего не беспокоит — это именно тот момент, когда стоит пройти первую профилактическую колоноскопию. Согласно рекомендациям ведущих мировых ассоциаций (ASGE, ESGE), именно в возрасте 45 лет начинается плановый скрининг колоректального рака для всех людей со средним риском.</p>

<h3 id="section-2" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Бессимптомное течение полипов и рака кишечника</h3>
<p style="margin-bottom: 16px;">Большинство полипов и ранних форм рака толстой кишки длительное время не вызывают никаких симптомов. Они не болят, не вызывают дискомфорта или кровотечений. Скрининговое обследование позволяет выявить эти изменения на ранней стадии или даже полностью предотвратить развитие заболевания, удалив полипы безболезненно прямо во время процедуры.</p>

<h3 id="section-3" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Как проходит процедура в 17-й городской больнице г. Харьков</h3>
<p style="margin-bottom: 16px;">В 17-й городской больнице обследование проводится на современном экспертном видеоэндоскопическом оборудовании врачом-эндоскопистом высшей категории Тетерником Алексеем Алексеевичем.</p>

<h3 id="section-4" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Медикаментозный сон и использование газа CO2</h3>
<p style="margin-bottom: 16px;">Чтобы вы не чувствовали никакой боли, страха или дискомфорта, колоноскопия выполняется в условиях медикаментозного сна (комфортной седации). Вы просто засыпаете на 15–20 минут, а когда просыпаетесь — процедура уже успешно завершена.</p>
<p style="margin-bottom: 16px;">Для расширения просвета кишки мы используем медицинский газ CO2, который мгновенно всасывается тканями и не вызывает вздутия или боли после осмотра.</p>

<h3 id="section-5" style="margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">Как записаться на консультацию или обследование</h3>
<p style="margin-bottom: 16px;">Не ждите появления жалоб. Позаботьтесь о своем здоровье вовремя — профилактика всегда эффективнее и проще лечения.</p>
"""

for aid in article_ids:
    uk_url = f"/articles/{aid}"
    ru_url = f"/ru/articles/{aid}"

    uk_dir = os.path.join(base_dir, "articles", aid)
    os.makedirs(uk_dir, exist_ok=True)
    with open(os.path.join(uk_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(generate_html("uk", uk_title, uk_meta, uk_h1, uk_sub, uk_toc, uk_content, uk_url, ru_url))

    ru_dir = os.path.join(base_dir, "ru", "articles", aid)
    os.makedirs(ru_dir, exist_ok=True)
    with open(os.path.join(ru_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(generate_html("ru", ru_title, ru_meta, ru_h1, ru_sub, ru_toc, ru_content, uk_url, ru_url))

print("Both kolonoskopiya-45 and age-colonoscopy article routes generated successfully.")
