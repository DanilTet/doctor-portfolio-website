import json
import os

filepath = os.path.join(os.path.dirname(__file__), '..', 'server', 'data', 'posts.json')

if not os.path.exists(filepath):
    print("Database not found!")
    exit(1)

with open(filepath, 'r', encoding='utf-8') as f:
    posts = json.load(f)

# Fix .html and remove duplicates
seen_urls = set()
cleaned_posts = []

for p in posts:
    url = p.get('external_url')
    if url:
        # Strip .html
        if url.endswith('.html'):
            url = url[:-5]
        p['external_url'] = url
        
        # Check for duplicates based on external_url
        if url in seen_urls:
            continue
        seen_urls.add(url)
    
    cleaned_posts.append(p)

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(cleaned_posts, f, indent=2, ensure_ascii=False)

print(f"Fixed database! Removed .html and kept {len(cleaned_posts)} posts.")
