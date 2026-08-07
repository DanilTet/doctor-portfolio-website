import re
import sys

files = [
    'gastroscopy/index.html',
    'ru/gastroscopy/index.html',
    'en/gastroscopy/index.html'
]

titles = {
    'gastroscopy/index.html': '1. Коли необхідна гастроскопія?',
    'ru/gastroscopy/index.html': '1. Когда необходима гастроскопия?',
    'en/gastroscopy/index.html': '1. When is gastroscopy necessary?'
}

for filepath in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        continue

    # 1. Extract the newly added section
    section_pattern = re.compile(r'(\s*<!-- Section: When is it necessary & CTA -->\s*<div style="margin-bottom: 40px;">\s*<h2[^>]*>.*?</h2>(.*?)</div>\s*)(?=<!-- Table of Contents)', re.DOTALL)
    match = section_pattern.search(content)
    
    if not match:
        print(f"Could not find the new section in {filepath}, maybe already moved?")
        continue
        
    extracted_block = match.group(1)
    inner_text = match.group(2) # The <p> tags
    
    # Remove it from current position
    content = content.replace(extracted_block, '\n        ')
    
    # 2. Renumber TOC items and headers
    def increment_toc(m):
        num = int(m.group(1)) + 1
        return f"{num}. {m.group(2)}"
    
    content = re.sub(r'(\d+)\.\s+([А-ЯІЄЇA-Z])', increment_toc, content)
    
    # 3. Add the new TOC item
    new_toc_item = f"""
            <li>
              <a href="#when-needed" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'">
                {titles[filepath]}
              </a>
            </li>"""
    
    content = content.replace('<ul style="display: flex; flex-direction: column; gap: 12px; padding-left: 0; list-style-type: none; margin: 0;">',
                              '<ul style="display: flex; flex-direction: column; gap: 12px; padding-left: 0; list-style-type: none; margin: 0;">' + new_toc_item)
                              
    # 4. Insert the extracted block as Section 1
    new_section_id = "when-needed"
    new_section_html = f"""
        <!-- Section 1: When Needed -->
        <div id="{new_section_id}" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">{titles[filepath]}</h3>{inner_text}</div>
"""
    
    content = content.replace('<!-- Section 1: Why Important -->', new_section_html + '        <!-- Section 2: Why Important -->')
    content = content.replace('<!-- Section 2: 1 Day Before -->', '<!-- Section 3: 1 Day Before -->')
    content = content.replace('<!-- Section 3: Day of Exam -->', '<!-- Section 4: Day of Exam -->')
    content = content.replace('<!-- Section 4: Medications -->', '<!-- Section 5: Medications -->')
    content = content.replace('<!-- Section 5: Sedation -->', '<!-- Section 6: Sedation -->')
    content = content.replace('<!-- Section 6: Before Exam -->', '<!-- Section 7: Before Exam -->')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Fixed {filepath}")
