import json
import re

with open('src/lib/i18n.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

kr_start = content.find('const kr: Record<string, string> = {')
kr_end = content.find('};\n\nexport function I18nProvider')
if kr_end == -1:
    kr_end = content.find('};\r\n\r\nexport function I18nProvider')

kr_code = content[kr_start + 36:kr_end]

english_values = []
for line in kr_code.split('\n'):
    if '": "' not in line: continue
    parts = line.split('": "')
    if len(parts) >= 2:
        k = parts[0].strip().strip('"')
        v = '": "'.join(parts[1:]).strip().rstrip(',').rstrip('"')
        if k == v and len(k) > 3:
            if '@' not in k and not re.match(r'^[0-9\-\+\(\)\s]+$', k) and not re.match(r'^[A-Z0-9\-\.]+$', k):
                english_values.append(k)

print(f"Total English values remaining: {len(english_values)}")
with open('scratch/english_values.json', 'w', encoding='utf-8') as f:
    json.dump(english_values, f, indent=2, ensure_ascii=False)
