import os

files = ['gastroscopy.html', 'colonoscopy.html', 'uzd.html', 'surgery.html']
scripts = """
  <!-- Analytics Tracking -->
  <script src="/js/env.js"></script>
  <script src="/js/config.js"></script>
  <script src="/js/tracker.js"></script>
"""

for filename in files:
    filepath = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), filename)
    if not os.path.exists(filepath):
        print(f"Skipping {filename}: does not exist")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'tracker.js' in content:
        print(f"Skipping {filename}: already has tracker.js")
        continue
        
    if '</body>' in content:
        updated_content = content.replace('</body>', f"{scripts}\n</body>")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        print(f"Successfully added tracking scripts to {filename}")
    else:
        print(f"Skipping {filename}: </body> tag not found")
