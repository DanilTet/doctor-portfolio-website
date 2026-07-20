import glob

files = glob.glob('articles/*.html') + glob.glob('ru/articles/*.html')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Remove .html from hrefs
    content = content.replace('.html"', '"').replace('.html?', '?')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("HTML urls fixed")
