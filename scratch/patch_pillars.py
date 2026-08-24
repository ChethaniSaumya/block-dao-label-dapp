import json

missing = {
    "Artist First": "아티스트 최우선",
    "We fundamentally reform unfair contracts and opaque settlement structures so artists can focus solely on creation. Standardized contract guidelines, smart-contract-based automatic settlement, and end-to-end management support meaningfully protect artists' rights and revenue.": "우리는 아티스트가 창작에만 집중할 수 있도록 불공정한 계약과 불투명한 정산 구조를 근본적으로 개혁합니다. 표준화된 계약 가이드라인, 스마트 컨트랙트 기반 자동 정산, 엔드투엔드 매니지먼트 지원은 아티스트의 권리와 수익을 의미 있게 보호합니다.",
    "Standardized fair contracts": "표준화된 공정 계약",
    "Smart-contract auto settlement": "스마트 컨트랙트 자동 정산",
    "Full-spectrum creative support": "전방위 창작 지원",
    "Tech Innovation": "기술 혁신",
    "We combine AI production pipelines with blockchain infrastructure to remove inefficiency from the content industry. AI-driven planning, production, and post-production cut costs by up to 90%, while on-chain copyright registration and IP valuation systems objectively certify the value of every work.": "우리는 AI 제작 파이프라인과 블록체인 인프라를 결합하여 콘텐츠 산업의 비효율성을 제거합니다. AI 기반 기획, 제작 및 후반 작업은 비용을 최대 90%까지 절감하며, 온체인 저작권 등록 및 IP 가치 평가 시스템은 모든 작품의 가치를 객관적으로 증명합니다.",
    "AI hybrid production": "AI 하이브리드 제작",
    "On-chain copyright protection": "온체인 저작권 보호",
    "AI-driven IP valuation": "AI 기반 IP 가치 평가"
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
    print(f"Added {len(lines)} missing translations for the pillars!")
else:
    print("Already present.")
