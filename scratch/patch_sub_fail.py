import json

dictionary = {
    "submitted": "제출됨",
    "failed": "실패함"
}

with open('src/lib/i18n.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = []
for k, v in dictionary.items():
    if f'"{k}":' not in content:
        lines.append(f'  "{k}": "{v}",')

if lines:
    block = '\n' + '\n'.join(lines) + '\n'
    content = content.replace('};\n\nexport function I18nProvider', block + '};\n\nexport function I18nProvider')
    with open('src/lib/i18n.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Added {len(lines)} missing translations!")
else:
    print("Already present.")
