import re

files = [
    'gastroscopy/index.html',
    'ru/gastroscopy/index.html',
    'en/gastroscopy/index.html'
]

for filepath in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        continue

    # Extract the FAQ block
    # It starts with <!-- FAQ Section --> and ends with </div> just before <div style="margin-top: 40px; text-align: center;">
    faq_pattern = re.compile(r'(\s*<!-- FAQ Section -->.*?</div>\s*)(?=<div style="margin-top: 40px; text-align: center;">)', re.DOTALL)
    match = faq_pattern.search(content)
    
    if not match:
        print(f"Could not find FAQ in {filepath}")
        continue
        
    faq_block = match.group(1)
    
    # Remove FAQ block from the bottom
    content = content.replace(faq_block, '\n        ')
    
    # Compact the CSS/padding in the FAQ block
    faq_block = faq_block.replace('margin-bottom: 40px; margin-top: 60px;', 'margin-bottom: 32px; margin-top: 16px;')
    faq_block = faq_block.replace('margin-bottom: 24px; font-weight: 700;', 'margin-bottom: 16px; font-weight: 700;')
    faq_block = faq_block.replace('padding: 18px 20px;', 'padding: 14px 16px;')
    faq_block = faq_block.replace('font-size: 1.1rem;', 'font-size: 1rem;')
    faq_block = faq_block.replace('padding: 0 20px 20px 20px;', 'padding: 0 16px 16px 16px;')
    faq_block = faq_block.replace('font-size: 1.75rem;', 'font-size: 1.5rem;')
    
    # Insert it right before Section 2 (which is immediately after Section 1 and TOC)
    content = content.replace('<!-- Section 2: Why Important -->', faq_block + '\n        <!-- Section 2: Why Important -->')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Moved and compacted FAQ in {filepath}")
