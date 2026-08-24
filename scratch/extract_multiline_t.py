import os
import re
import json

def get_all_tsx_files(d):
    paths = []
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                paths.append(os.path.join(root, file))
    return paths

files = get_all_tsx_files('src')
strings = set()

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # DOTALL for multiline matches
    matches = re.findall(r't\(\s*\"(.*?)\"\s*\)', content, flags=re.DOTALL)
    for m in matches:
        strings.add(m.replace('\n', '').strip())
        strings.add(m)
        
    matches = re.findall(r't\(\s*\'(.*?)\'\s*\)', content, flags=re.DOTALL)
    for m in matches:
        strings.add(m.replace('\n', '').strip())
        strings.add(m)

with open('src/lib/i18n.tsx', 'r', encoding='utf-8') as f:
    i18n = f.read()

missing = []
for s in strings:
    s_normalized = s.replace('"', '\\"')
    # We also check if it exists in i18n
    if f'"{s_normalized}":' not in i18n and f'"{s_normalized.split("·")[0].strip()}":' not in i18n:
        missing.append(s)

print(f"Total extracted from t(): {len(strings)}")
print(f"Missing from i18n: {len(missing)}")

with open('scratch/missing_multiline_t.json', 'w', encoding='utf-8') as f:
    json.dump(missing, f, indent=2, ensure_ascii=False)
