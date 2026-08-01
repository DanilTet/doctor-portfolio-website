import os
import re

TARGET_CSS_FILES = ['styles.css', 'animations.css', 'blog.css']
CACHE_BUSTER = 'v=2.0'

def update_html_files(root_dir):
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # skip scratch folder
        if 'scratch' in dirpath:
            continue
            
        for file in filenames:
            if file.endswith('.html'):
                filepath = os.path.join(dirpath, file)
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Regex to match href=".../styles.css" or href="styles.css"
                # It optionally matches any existing query string and replaces it
                updated = False
                def replacer(match):
                    nonlocal updated
                    base_path = match.group(1)
                    
                    new_href = f'href="{base_path}?{CACHE_BUSTER}"'
                    if new_href != match.group(0):
                        updated = True
                    return new_href
                
                new_content = re.sub(r'href="([^"]*/?(?:styles\.css|animations\.css|blog\.css))(\?[^"]*)?"', replacer, content)
                
                if updated:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")

if __name__ == "__main__":
    update_html_files('c:/oleg-site/doctor-portfolio-website')
