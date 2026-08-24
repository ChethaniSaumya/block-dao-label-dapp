import json

missing = {
    "BEP-20": "BEP-20",
    "BNB Chain (BSC)": "BNB Chain (BSC)",
    "10,000,000,000 (fixed)": "10,000,000,000 (고정)",
    "TBA at TGE": "TGE 시 공개",
    "Token Standard": "토큰 표준",
    "Chain": "메인넷",
    "Total Supply": "총 발행량",
    "Contract": "컨트랙트",
    "General DAO": "제너럴 DAO",
    "Core Product Development": "핵심 제품 개발",
    "Emergency Fund": "긴급 펀드",
    "Marketing": "마케팅",
    "Governance": "거버넌스",
    "Early Participants": "초기 참여자",
    "Team (locked · burn-linked)": "팀 (잠금 · 소각 연계)"
}

with open('src/lib/i18n.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = []
for k, v in missing.items():
    if f'"{k}":' not in content:
        lines.append(f'  "{k}": "{v}",')

if lines:
    block = '\n' + '\n'.join(lines) + '\n'
    content = content.replace('};\n\nexport function I18nProvider', block + '};\n\nexport function I18nProvider')
    with open('src/lib/i18n.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Added {len(lines)} missing translations for about.tsx!")
else:
    print("Already present.")
