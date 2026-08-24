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

# Match t("something") or t('something') or t(`something`)
# Actually, let's just match t("something")
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # regex for t("...")
    matches = re.findall(r't\(\s*\"(.*?)\"\s*\)', content)
    strings.update(matches)
    matches = re.findall(r't\(\s*\'(.*?)\'\s*\)', content)
    strings.update(matches)

# Let's also parse site-content.ts again just in case
with open('src/lib/site-content.ts', 'r', encoding='utf-8') as f:
    sc = f.read()

# we already got site-content stuff mostly, but let's see.
with open('src/lib/i18n.tsx', 'r', encoding='utf-8') as f:
    i18n = f.read()

missing = []
for s in strings:
    if f'"{s.replace("₩", "").split("·")[0]}":' not in i18n and f'"{s}":' not in i18n:
        missing.append(s)

print(f"Total extracted from t(): {len(strings)}")
print(f"Missing from i18n: {len(missing)}")

with open('scratch/missing_t.json', 'w', encoding='utf-8') as f:
    json.dump(missing, f, indent=2, ensure_ascii=False)
