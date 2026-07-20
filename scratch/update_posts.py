import json
import uuid
import datetime

filepath = 'c:/oleg-site/doctor-portfolio-website/server/data/posts.json'

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

posts.extend(new_posts)

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(posts, f, indent=2, ensure_ascii=False)

print("Posts updated successfully.")
