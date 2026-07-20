import json
import uuid
import datetime
import os

filepath = os.path.join(os.path.dirname(__file__), '..', 'server', 'data', 'posts.json')

with open(filepath, 'r', encoding='utf-8') as f:
    posts = json.load(f)

new_posts = [
    {
        "id": str(uuid.uuid4()),
        "title": "🌶 Печія — це не норма!",
        "content": "Звичайна печія чи прихована небезпека? Розбираємось, коли варто бити на сполох та навіщо робити гастроскопію.",
        "image_path": None,
        "date": datetime.datetime.utcnow().isoformat() + "Z",
        "source": "manual",
        "tags": ["Гастроскопія"],
        "external_url": "/articles/pechiya.html"
    },
    {
        "id": str(uuid.uuid4()),
        "title": "🤷‍♂️ Мені лише 25, навіщо колоноскопія?",
        "content": "Міфи про вік та обстеження кишківника. Коли колоноскопія життєво необхідна, незважаючи на молодість.",
        "image_path": None,
        "date": datetime.datetime.utcnow().isoformat() + "Z",
        "source": "manual",
        "tags": ["Колоноскопія"],
        "external_url": "/articles/age-colonoscopy.html"
    },
    {
        "id": str(uuid.uuid4()),
        "title": "🍔 З'їв бутерброд перед УЗД: що буде?",
        "content": "«Я тільки кави випив!» — як ми псуємо своє УЗД і чому підготовка така важлива для точного результату.",
        "image_path": None,
        "date": datetime.datetime.utcnow().isoformat() + "Z",
        "source": "manual",
        "tags": ["УЗД"],
        "external_url": "/articles/food-uzd.html"
    }
]

# Ensure we don't add duplicates if ran multiple times
existing_urls = [p.get('external_url') for p in posts]
posts_to_add = [p for p in new_posts if p['external_url'] not in existing_urls]

if posts_to_add:
    posts.extend(posts_to_add)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)
    print(f"Added {len(posts_to_add)} posts successfully.")
else:
    print("Posts already exist in the database.")
