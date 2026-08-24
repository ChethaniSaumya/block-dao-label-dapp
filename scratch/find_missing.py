import re

with open('src/lib/site-content.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# find all strings
matches = re.findall(r'(?:title|eyebrow|body|intro|meta|nav|label|question|answer|submitLabel|placeholder):\s*\"(.*?)\"', content)
matches = list(set(matches))

with open('src/lib/i18n.tsx', 'r', encoding='utf-8') as f:
    i18n_content = f.read()

missing = []
for m in matches:
    # Need to check if m is a key in i18n_content
    # e.g. \"{m}\": or {m}:
    escaped_m = m.replace('"', '\\"').replace('\n', '\\n')
    if f'"{escaped_m}":' not in i18n_content and f'{m}:' not in i18n_content:
        missing.append(m)

print('Missing translations:', len(missing))
for m in missing:
    print('  -', m)
