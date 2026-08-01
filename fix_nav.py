
import os

files = ['index.html', 'ru.html', 'en.html']

target = '''        <ul class=\"nav__list\">
          <li><a href=\"#about\" class=\"nav__link\" data-i18n=\"nav.about\">Про лікаря</a></li>
          <li><a href=\"#blog\" class=\"nav__link\" data-i18n=\"nav.blog\">Блог</a></li>
          <li><a href=\"#topics\" class=\"nav__link\" data-i18n=\"nav.topics\">Теми</a></li>
          <li><a href=\"#diplomas\" class=\"nav__link\" data-i18n=\"nav.diplomas\">Дипломи</a></li>
          <li><a href=\"#reviews\" class=\"nav__link\" data-i18n=\"nav.reviews\">Відгуки</a></li>
          <li><a href=\"#contacts\" class=\"nav__link\" data-i18n=\"nav.contacts\">Контакти</a></li>
        </ul>'''

replacement = '''        <ul class=\"nav__list\">
          <li><a href=\"#topics\" class=\"nav__link\" data-i18n=\"nav.topics\">Теми</a></li>
          <li><a href=\"#blog\" class=\"nav__link\" data-i18n=\"nav.blog\">Блог</a></li>
          <li><a href=\"#about\" class=\"nav__link\" data-i18n=\"nav.about\">Про лікаря</a></li>
          <li><a href=\"#diplomas\" class=\"nav__link\" data-i18n=\"nav.diplomas\">Дипломи</a></li>
          <li><a href=\"#reviews\" class=\"nav__link\" data-i18n=\"nav.reviews\">Відгуки</a></li>
          <li><a href=\"#contacts\" class=\"nav__link\" data-i18n=\"nav.contacts\">Контакти</a></li>
        </ul>'''

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        if target in content:
            new_content = content.replace(target, replacement)
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f'Updated {f}')
        else:
            print(f'Target not found in {f}')

