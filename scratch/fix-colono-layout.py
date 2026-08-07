import re

files = [
    'colonoscopy/index.html',
    'ru/colonoscopy/index.html',
    'en/colonoscopy/index.html'
]

titles = {
    'colonoscopy/index.html': '1. Коли необхідна колоноскопія?',
    'ru/colonoscopy/index.html': '1. Когда необходима колоноскопия?',
    'en/colonoscopy/index.html': '1. When is a colonoscopy necessary?'
}

for filepath in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        continue

    # 1. Extract Intro block and FAQ block
    # In my previous script, I inserted:
    # <!-- Intro Section -->
    # <div style="margin-bottom: 40px;">
    # ...
    # </div>
    #
    # <!-- FAQ Section -->
    # <style>...</style>
    # <div style="margin-bottom: 24px; margin-top: 0px;">
    # ...
    # </div>
    
    intro_pattern = re.compile(r'(\s*<!-- Intro Section -->\s*<div style="margin-bottom: 40px;">\s*<h2[^>]*>(.*?)</h2>(.*?)</div>\s*)(?=<!-- FAQ Section -->)', re.DOTALL)
    intro_match = intro_pattern.search(content)
    
    if not intro_match:
        print(f"Could not find Intro block in {filepath}")
        continue
        
    intro_full_block = intro_match.group(1)
    intro_title_text = intro_match.group(2)
    intro_body = intro_match.group(3)
    
    content = content.replace(intro_full_block, '\n        ')
    
    faq_pattern = re.compile(r'(\s*<!-- FAQ Section -->.*?</div>\s*)(?=<!-- Table of Contents)', re.DOTALL)
    faq_match = faq_pattern.search(content)
    
    if not faq_match:
        print(f"Could not find FAQ block in {filepath}")
        continue
        
    faq_full_block = faq_match.group(1)
    
    # Remove FAQ from current position
    content = content.replace(faq_full_block, '\n        ')
    
    # 2. Insert FAQ block right at the top of the card
    # Find: <div class="card" style="max-width: 800px; margin: 0 auto; line-height: 1.8;">
    card_str = '<div class="card" style="max-width: 800px; margin: 0 auto; line-height: 1.8;">'
    # Wait, in the FAQ I need to compact it like I did for gastroscopy
    faq_full_block = faq_full_block.replace('margin-bottom: 24px; margin-top: 0px;', 'margin-bottom: 24px; margin-top: 0px;')
    faq_full_block = faq_full_block.replace('margin-bottom: 12px; font-weight: 700;', 'margin-bottom: 12px; font-weight: 700;')
    faq_full_block = faq_full_block.replace('padding: 12px 14px;', 'padding: 12px 14px;')
    faq_full_block = faq_full_block.replace('font-size: 0.95rem;', 'font-size: 0.95rem;')
    faq_full_block = faq_full_block.replace('padding: 0 14px 14px 14px;', 'padding: 0 14px 14px 14px;')
    faq_full_block = faq_full_block.replace('font-size: 1.25rem;', 'font-size: 1.25rem;')

    content = content.replace(card_str, card_str + faq_full_block)
    
    # 3. Renumber TOC and existing sections
    def increment_toc(m):
        num = int(m.group(1)) + 1
        return f"{num}. {m.group(2)}"
    
    # E.g. "1. Почему" -> "2. Почему"
    content = re.sub(r'(\d+)\.\s+([А-ЯІЄЇA-Z])', increment_toc, content)
    
    # 4. Insert Intro into TOC
    new_toc_item = f"""
            <li>
              <a href="#when-needed" style="color: var(--color-primary); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary-light)'" onmouseout="this.style.color='var(--color-primary)'">
                {titles[filepath]}
              </a>
            </li>"""
    
    content = content.replace('<ul style="display: flex; flex-direction: column; gap: 12px; padding-left: 0; list-style-type: none; margin: 0;">',
                              '<ul style="display: flex; flex-direction: column; gap: 12px; padding-left: 0; list-style-type: none; margin: 0;">' + new_toc_item)
                              
    # 5. Insert Intro block as Section 1 right after TOC
    new_section_id = "when-needed"
    new_section_html = f"""
        <!-- Section 1: When Needed -->
        <div id="{new_section_id}" style="scroll-margin-top: 100px; margin-bottom: 40px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; font-weight: 700; font-size: 1.5rem; color: var(--color-text-light);">{titles[filepath]}</h3>{intro_body}</div>
"""
    
    content = content.replace('<!-- Section 1: Why Important -->', new_section_html + '        <!-- Section 2: Why Important -->')
    content = content.replace('<!-- Section 2: Diet 3 Days -->', '<!-- Section 3: Diet 3 Days -->')
    content = content.replace('<!-- Section 3: Diet 1 Day -->', '<!-- Section 4: Diet 1 Day -->')
    content = content.replace('<!-- Section 4: Eziclen Schedule -->', '<!-- Section 5: Eziclen Schedule -->')
    content = content.replace('<!-- Section 5: Important Tips -->', '<!-- Section 6: Important Tips -->')
    content = content.replace('<!-- Section 6: Video Guide -->', '<!-- Section 7: Video Guide -->')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Fixed {filepath}")
