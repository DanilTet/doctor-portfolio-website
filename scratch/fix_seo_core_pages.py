import urllib.request
import re
import os

pages = ['gastroscopy', 'colonoscopy', 'uzd', 'surgery']
langs = [('uk', ''), ('ru', 'ru/')]

def get_title(page, lang):
    if page == 'gastroscopy':
        if lang == 'ru': return "Гастроскопия в Харькове, 17 больница | Врач Тетерник О.О."
        else: return "Гастроскопія у Харкові, 17 лікарня | Лікар Тетернік О.О."
    elif page == 'colonoscopy':
        if lang == 'ru': return "Колоноскопия в Харькове, 17 больница | Врач Тетерник О.О."
        else: return "Колоноскопія у Харкові, 17 лікарня | Лікар Тетернік О.О."
    elif page == 'uzd':
        if lang == 'ru': return "УЗИ в Харькове, 17 больница | Врач Тетерник О.О."
        else: return "УЗД у Харкові, 17 лікарня | Лікар Тетернік О.О."
    elif page == 'surgery':
        if lang == 'ru': return "Хирургия в Харькове, 17 больница | Врач Тетерник О.О."
        else: return "Хірургія у Харкові, 17 лікарня | Лікар Тетернік О.О."

def get_desc(page, lang):
    if page == 'gastroscopy':
        if lang == 'ru': return "Гастроскопия в Харькове — без боли. Врач Тетерник О.О., 17-я городская клиническая больница."
        else: return "Гастроскопія у Харкові — без болю. Лікар Тетернік О.О., 17-та міська клінічна лікарня."
    elif page == 'colonoscopy':
        if lang == 'ru': return "Колоноскопия в Харькове (во сне). Врач Тетерник О.О., 17-я городская клиническая больница."
        else: return "Колоноскопія у Харкові (уві сні). Лікар Тетернік О.О., 17-та міська клінічна лікарня."
    elif page == 'uzd':
        if lang == 'ru': return "УЗИ брюшной полости в Харькове. Врач Тетерник О.О., 17-я городская клиническая больница."
        else: return "УЗД черевної порожнини у Харкові. Лікар Тетернік О.О., 17-та міська клінічна лікарня."
    elif page == 'surgery':
        if lang == 'ru': return "Хирургия в Харькове: удаление полипов. Врач Тетерник О.О., 17-я городская клиническая больница."
        else: return "Хірургія у Харкові: видалення поліпів. Лікар Тетернік О.О., 17-та міська клінічна лікарня."

for lang_code, prefix in langs:
    for page in pages:
        url = f"https://endo.kh.ua/{prefix}{page}/"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                html = response.read().decode('utf-8')
            
            # Replace title
            new_title = get_title(page, lang_code)
            html = re.sub(r'<title>.*?</title>', f'<title>{new_title}</title>', html, flags=re.IGNORECASE|re.DOTALL)
            html = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{new_title}">', html)
            
            # Replace description
            new_desc = get_desc(page, lang_code)
            html = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{new_desc}">', html)
            html = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{new_desc}">', html)
            
            # Write to file
            filepath = os.path.join(r"C:\oleg-site\doctor-portfolio-website", prefix, page, "index.html")
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"Fixed {filepath}")
        except Exception as e:
            print(f"Failed {url}: {e}")
