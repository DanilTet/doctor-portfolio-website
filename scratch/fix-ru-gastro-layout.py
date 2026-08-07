import re

filepath = 'ru/gastroscopy/index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Renumber TOC items and headers
def increment_toc(m):
    num = int(m.group(1)) + 1
    return f"{num}. {m.group(2)}"

content = re.sub(r'(\d+)\.\s+([А-ЯІЄЇA-Z])', increment_toc, content)

# 2. Add the new TOC item
new_toc_item = f"""
            <li>
              <a href="#when-needed"
                style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;"
                onmouseover="this.style.color='var(--color-primary-light)'"
                onmouseout="this.style.color='var(--color-primary)'">1. Когда необходима гастроскопия?</a>
            </li>"""

content = content.replace('<ul\n            style="display: flex; flex-direction: column; gap: 12px; padding-left: 0; list-style-type: none; margin: 0;">',
                          '<ul\n            style="display: flex; flex-direction: column; gap: 12px; padding-left: 0; list-style-type: none; margin: 0;">' + new_toc_item)

# 3. Insert the block as Section 1
new_section_html = f"""
        <!-- Section 1: When Needed -->
        <div id="when-needed" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3
            style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">1. Когда необходима гастроскопия?</h3>
          <p style="margin-bottom: 16px;">
            Если вас регулярно беспокоит изжога, тяжесть после еды, боли в желудке, тошнота или подозрение на гастрит, вам необходима качественная <strong>гастроскопия в Харькове</strong>. Это самое точное обследование, позволяющее оценить состояние пищевода, желудка и двенадцатиперстной кишки.
          </p>
          <p style="margin-bottom: 16px;">
            Процедуры проводит врач-эндоскопист <strong>Тетерник Олег Александрович</strong> на современном тонком видеоэндоскопе в специально оборудованном кабинете <strong>в 17-й городской больнице</strong>. По желанию возможно проведение исследования в состоянии медикаментозного сна (седации) — абсолютно без боли и дискомфорта.
          </p>
          <p style="margin-bottom: 0;">
            Если у вас остались вопросы или вы хотите проконсультироваться перед обследованием, жмите на кнопку записи внизу страницы!
          </p>
        </div>
"""

content = content.replace('<!-- Section 1: Why Important -->', new_section_html + '\n        <!-- Section 2: Why Important -->')
content = content.replace('<!-- Section 2: 1 Day Before -->', '<!-- Section 3: 1 Day Before -->')
content = content.replace('<!-- Section 3: Day of Exam -->', '<!-- Section 4: Day of Exam -->')
content = content.replace('<!-- Section 4: Medications -->', '<!-- Section 5: Medications -->')
content = content.replace('<!-- Section 5: Sedation -->', '<!-- Section 6: Sedation -->')
content = content.replace('<!-- Section 6: Before Exam -->', '<!-- Section 7: Before Exam -->')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed {filepath}")
