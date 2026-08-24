import json

with open('src/lib/i18n.tsx', 'r', encoding='utf-8') as f:
    kr = f.read()

missing_placeholders = {
    "John Doe": "홍길동",
    "010-0000-0000": "010-0000-0000",
    "name@example.com": "name@example.com",
    "Seoul": "서울",
    "Gangnam-gu": "강남구",
    "REFERRER CODE": "추천인 코드",
    "Feel free to share your operating experience, desired start date, or any questions.": "운영 경험, 희망 시작일 또는 기타 질문을 자유롭게 남겨주세요."
}

lines = []
for k, v in missing_placeholders.items():
    if f'"{k}"' not in kr:
        lines.append(f'  "{k}": "{v}",')

if lines:
    block = '\n' + '\n'.join(lines) + '\n'
    kr = kr.replace('};\n\nexport function I18nProvider', block + '};\n\nexport function I18nProvider')
    with open('src/lib/i18n.tsx', 'w', encoding='utf-8') as f:
        f.write(kr)
    print("Added missing placeholders.")
else:
    print("Placeholders already present.")
