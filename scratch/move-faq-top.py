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
    # It starts with <!-- FAQ Section --> and ends just before <!-- Section 2: Why Important -->
    faq_pattern = re.compile(r'(\s*<!-- FAQ Section -->.*?)(?=\s*<!-- Section 2: Why Important -->)', re.DOTALL)
    match = faq_pattern.search(content)
    
    if not match:
        print(f"Could not find FAQ in {filepath}")
        continue
        
    faq_block = match.group(1)
    
    # Remove FAQ block from the current position
    content = content.replace(faq_block, '')
    
    # Compact the CSS/padding in the FAQ block even more
    faq_block = faq_block.replace('margin-bottom: 32px; margin-top: 16px;', 'margin-bottom: 24px; margin-top: 0px;')
    faq_block = faq_block.replace('margin-bottom: 16px; font-weight: 700;', 'margin-bottom: 12px; font-weight: 700;')
    faq_block = faq_block.replace('padding: 14px 16px;', 'padding: 12px 14px;')
    faq_block = faq_block.replace('font-size: 1rem;', 'font-size: 0.95rem;')
    faq_block = faq_block.replace('padding: 0 16px 16px 16px;', 'padding: 0 14px 14px 14px;')
    faq_block = faq_block.replace('font-size: 1.5rem;', 'font-size: 1.25rem;')
    
    # We also have the HTML: <div style="margin-bottom: 32px; margin-top: 16px;">
    # Let's just make it really tight
    faq_block = faq_block.replace('margin-bottom: 32px; margin-top: 16px;', 'margin-bottom: 24px; margin-top: 0px;')
    
    # Insert it right before the TOC block
    toc_comment = '<!-- Table of Contents / Путівник'
    
    # We will search for '<!-- Table of Contents' and insert before it
    # We use a simple replace because the TOC comment is unique enough, wait, the comment is:
    # <!-- Table of Contents / Путівник по питанням -->
    # For english: <!-- Table of Contents
    
    # Better to find <!-- Table of Contents
    parts = content.split('<!-- Table of Contents')
    if len(parts) >= 2:
        content = parts[0] + faq_block + '\n        <!-- Table of Contents' + '<!-- Table of Contents'.join(parts[1:])
    else:
        print(f"Could not find TOC in {filepath}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Moved FAQ to top in {filepath}")
