import re

files = ['gastroscopy.html', 'colonoscopy.html', 'uzd.html', 'surgery.html']

modal_html = """
  <!-- ============================================================
       APPOINTMENT BOOKING MODAL (Telegram + Main Form Link)
       ============================================================ -->
  <div class="modal" id="appointment-modal" aria-hidden="true" role="dialog">
    <div class="modal__overlay" data-modal-close></div>
    <div class="modal__window modal__window--form" style="max-width: 480px;">
      <button class="modal__close" data-modal-close aria-label="Close modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="modal__header" style="text-align: center; margin-bottom: 24px;">
        <h3 class="modal__title" data-i18n="appointment.modal.title">Запис на прийом</h3>
        <p class="modal__subtitle" data-i18n="appointment.modal.subtitle" style="margin-top: 8px;">Оберіть зручний для вас спосіб запису</p>
      </div>

      <div class="modal__body" style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Option 1: Telegram Bot -->
        <a href="https://t.me/AppointmentEndoscopyBot" class="btn btn--primary" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          <span data-i18n="appointment.tg.btn">Записатися через Telegram-бот</span>
        </a>

        <!-- Option 2: Website Form Redirect -->
        <a href="/#appointment-section" class="btn btn--outline" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span data-i18n="appointment.form.btn_redirect">Заповнити форму на сайті</span>
        </a>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // Header scrolled state
      const header = document.getElementById('header');
      function checkScroll() {
        if (window.scrollY > 20) {
          header.classList.add('header--scrolled');
        } else {
          header.classList.remove('header--scrolled');
        }
      }
      window.addEventListener('scroll', checkScroll);
      checkScroll();

      // Modal open/close logic
      const modal = document.getElementById('appointment-modal');
      const openBtns = document.querySelectorAll('.open-booking-modal');
      const closeBtns = document.querySelectorAll('[data-modal-close]');

      openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          modal.classList.add('modal--active');
          modal.setAttribute('aria-hidden', 'false');
        });
      });

      closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          modal.classList.remove('modal--active');
          modal.setAttribute('aria-hidden', 'true');
        });
      });
    });
  </script>
</body>
</html>
"""

for fn in files:
    with open(fn, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add open-booking-modal class to header CTA
    content = content.replace(
        'class="btn btn--primary header__cta"',
        'class="btn btn--primary header__cta open-booking-modal"'
    )

    # Add open-booking-modal class to body CTA
    # Let's find the bottom button link. It has 'btn btn--primary' and data-i18n="service.*.btn"
    content = re.sub(
        r'class="btn btn--primary"(\s+data-i18n="service\.\w+\.btn")',
        r'class="btn btn--primary open-booking-modal"\1',
        content
    )

    # Append modal and script block
    content = content.replace('</body>\n</html>', modal_html)
    content = content.replace('</body></html>', modal_html)

    with open(fn, 'w', encoding='utf-8') as f:
        f.write(content)

print("Subpages modified successfully.")

# 4. Update build.js with translation keys
with open('build.js', 'r', encoding='utf-8') as f:
    build_js = f.read()

# Add translation keys for RU
ru_key_marker = """    // Нові ключі для сторінок послуг
    'service.back': 'Назад на главную',"""
ru_key_new = """    // Нові ключі для сторінок послуг
    'service.back': 'Назад на главную',
    'appointment.form.btn_redirect': 'Заполнить форму на сайте',"""
build_js = build_js.replace(ru_key_marker, ru_key_new)

# Add translation keys for EN
en_key_marker = """    // New keys for English service pages
    'service.back': 'Back to homepage',"""
en_key_new = """    // New keys for English service pages
    'service.back': 'Back to homepage',
    'appointment.form.btn_redirect': 'Fill out form on website',"""
build_js = build_js.replace(en_key_marker, en_key_new)

with open('build.js', 'w', encoding='utf-8') as f:
    f.write(build_js)

print("build.js updated with redirect button translations.")
