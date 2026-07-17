import os
import re

TARGET_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OLD_ICON_REGEX = re.compile(r'<link\s+rel="icon"\s+href="data:image/svg\+xml,[^"]+">', re.IGNORECASE)
NEW_ICON_TAG = '<link rel="icon" href="/favicon.png" type="image/png">'

def update_html_files(directory):
    for root, dirs, files in os.walk(directory):
        # Skip node_modules
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if OLD_ICON_REGEX.search(content):
                        new_content = OLD_ICON_REGEX.sub(NEW_ICON_TAG, content)
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated: {file_path}")
                except Exception as e:
                    print(f"Error updating {file_path}: {e}")

if __name__ == "__main__":
    print(f"Target directory: {TARGET_DIR}")
    update_html_files(TARGET_DIR)
