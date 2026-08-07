import re
import json

languages = {
    'ru': {
        'file': 'ru/gastroscopy/index.html',
        'title': 'Частые вопросы (FAQ)',
        'q1': 'Больно ли делать гастроскопию?',
        'a1': 'При проведении гастроскопии в состоянии медикаментозного сна (седации) вы не почувствуете абсолютно никакой боли или дискомфорта. Вы просто спите, пока врач проводит осмотр. При обычной процедуре используется местный анестетик (спрей лидокаина), что сводит неприятные ощущения к минимуму.',
        'q2': 'Сколько времени занимает само обследование?',
        'a2': 'Сама процедура осмотра желудка занимает в среднем 5–10 минут. Если требуется взятие биопсии или удаление полипов, время может немного увеличиться. С учетом подготовки и беседы с врачом, рассчитывайте провести в клинике около 30–40 минут.',
        'q3': 'Можно ли пить воду перед ФГДС?',
        'a3': 'Утром в день исследования пить жидкости крайне нежелательно. Допускается сделать несколько глотков чистой негазированной воды (например, чтобы запить жизненно важные лекарства) не позднее, чем за 2 часа до начала процедуры.'
    },
    'uk': {
        'file': 'gastroscopy/index.html',
        'title': 'Поширені запитання (FAQ)',
        'q1': 'Чи боляче робити гастроскопію?',
        'a1': 'При проведенні гастроскопії у стані медикаментозного сну (седації) ви не відчуєте жодного болю чи дискомфорту. Ви просто спите, поки лікар проводить огляд. При звичайній процедурі використовується місцевий анестетик (спрей лідокаїну), що зводить неприємні відчуття до мінімуму.',
        'q2': 'Скільки часу займає саме обстеження?',
        'a2': 'Сама процедура огляду шлунка займає в середньому 5–10 хвилин. Якщо потрібне взяття біопсії або видалення поліпів, час може трохи збільшитися. З урахуванням підготовки та розмови з лікарем, розраховуйте провести в клініці близько 30–40 хвилин.',
        'q3': 'Чи можна пити воду перед ВГДС?',
        'a3': 'Вранці в день дослідження пити рідини вкрай небажано. Допускається зробити кілька ковтків чистої негазованої води (наприклад, щоб запити життєво важливі ліки) не пізніше, ніж за 2 години до початку процедури.'
    },
    'en': {
        'file': 'en/gastroscopy/index.html',
        'title': 'Frequently Asked Questions (FAQ)',
        'q1': 'Is gastroscopy painful?',
        'a1': 'If gastroscopy is performed under medication-induced sleep (sedation), you will not feel any pain or discomfort. You simply sleep while the doctor performs the examination. During a standard procedure, a local anesthetic (lidocaine spray) is used, minimizing unpleasant sensations.',
        'q2': 'How long does the examination take?',
        'a2': 'The actual stomach examination procedure takes an average of 5–10 minutes. If a biopsy or polyp removal is required, the time may increase slightly. Including preparation and consultation with the doctor, expect to spend about 30–40 minutes at the clinic.',
        'q3': 'Can I drink water before EGD?',
        'a3': 'In the morning on the day of the examination, drinking liquids is highly undesirable. You are allowed to take a few sips of clean, still water (for example, to wash down vital medications) no later than 2 hours before the start of the procedure.'
    }
}

style_block = """
        <style>
          .faq-details {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 8px;
            margin-bottom: 12px;
            overflow: hidden;
            transition: background 0.3s ease;
          }
          .faq-details:hover {
            background: rgba(255, 255, 255, 0.04);
          }
          .faq-summary {
            padding: 18px 20px;
            font-weight: 600;
            font-size: 1.1rem;
            color: var(--color-text-light);
            cursor: pointer;
            list-style: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .faq-summary::-webkit-details-marker {
            display: none;
          }
          .faq-summary::after {
            content: '+';
            font-size: 1.5rem;
            line-height: 1;
            color: var(--color-primary);
            transition: transform 0.3s ease;
          }
          .faq-details[open] .faq-summary::after {
            content: '−';
            transform: rotate(180deg);
          }
          .faq-content {
            padding: 0 20px 20px 20px;
            color: var(--color-text);
            line-height: 1.6;
          }
        </style>
"""

for lang, data in languages.items():
    filepath = data['file']
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Failed to open {filepath}: {e}")
        continue

    # 1. Generate Schema.org JSON-LD
    schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": data['q1'],
          "acceptedAnswer": {
            "@type": "Answer",
            "text": data['a1']
          }
        },
        {
          "@type": "Question",
          "name": data['q2'],
          "acceptedAnswer": {
            "@type": "Answer",
            "text": data['a2']
          }
        },
        {
          "@type": "Question",
          "name": data['q3'],
          "acceptedAnswer": {
            "@type": "Answer",
            "text": data['a3']
          }
        }
      ]
    }
    
    schema_script = f"\n  <!-- JSON-LD: FAQ -->\n  <script type=\"application/ld+json\">\n  {json.dumps(schema, ensure_ascii=False, indent=2)}\n  </script>\n</head>"
    
    # Inject Schema before </head>
    if "FAQPage" not in content:
        content = content.replace("</head>", schema_script)
    
    # 2. Generate HTML Block
    html_block = f"""
        <!-- FAQ Section -->
        {style_block}
        <div style="margin-bottom: 40px; margin-top: 60px;">
          <h2 style="margin-top: 0; margin-bottom: 24px; font-weight: 700; font-size: 1.75rem; color: var(--color-text-light); text-align: center;">{data['title']}</h2>
          
          <details class="faq-details">
            <summary class="faq-summary">{data['q1']}</summary>
            <div class="faq-content">{data['a1']}</div>
          </details>
          
          <details class="faq-details">
            <summary class="faq-summary">{data['q2']}</summary>
            <div class="faq-content">{data['a2']}</div>
          </details>

          <details class="faq-details">
            <summary class="faq-summary">{data['q3']}</summary>
            <div class="faq-content">{data['a3']}</div>
          </details>
        </div>

        <div style="margin-top: 40px; text-align: center;">"""
    
    # Find the final div containing the appointment button and inject before it
    # We look for: <div style="margin-top: 40px; text-align: center;">
    if '<!-- FAQ Section -->' not in content:
        content = content.replace('<div style="margin-top: 40px; text-align: center;">', html_block)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Successfully added FAQ to {filepath}")
