import json

missing = {
    "Contributing to the Binance Smart Chain ecosystem": "바이낸스 스마트 체인 생태계에 기여",
    "Roadmap": "로드맵",
    "Partners & Ecosystem Projects": "파트너 및 생태계 프로젝트",
    "Token Allocation": "토큰 할당",
    "BSC Ecosystem Contribution": "BSC 생태계 기여",
    "About {{BRAND}}": "{{BRAND}} 소개",
    "What is {{BRAND}}?": "{{BRAND}}란 무엇인가요?",
    "{{BRAND}} ({{SYMBOL}}) is the native utility and governance token of the ecosystem, built on BNB Chain (BEP-20). The total supply is fixed at 10,000,000,000 {{SYMBOL}} with no minting capability, and 50% is allocated to the community through the Fan DAO and Creator DAO. Distribution is fully on-chain, transparent, and independently verifiable.": "{{BRAND}} ({{SYMBOL}})은 BNB 체인(BEP-20)을 기반으로 구축된 생태계의 기본 유틸리티 및 거버넌스 토큰입니다. 총 공급량은 발행 기능 없이 10,000,000,000 {{SYMBOL}}로 고정되어 있으며, 50%는 팬 DAO와 크리에이터 DAO를 통해 커뮤니티에 할당됩니다. 분배는 완전히 온체인에서 이루어지며, 투명하고 독립적으로 검증 가능합니다.",
    "Rather than an unconditional distribution, {{SYMBOL}} is claimed by verified ecosystem participants who meet corporate DAO and staking conditions. A rules-based buyback & burn — funded by real IP value growth — continuously reduces supply, and the team allocation is locked until the burn milestone is reached.": "무조건적인 분배 대신, {{SYMBOL}}은 기업 DAO 및 스테이킹 조건을 충족하는 검증된 생태계 참여자에게 청구됩니다. 실제 IP 가치 성장을 통해 자금이 조달되는 규칙 기반의 바이백 및 소각은 지속적으로 공급을 줄이며, 팀 할당량은 소각 목표에 도달할 때까지 잠금됩니다.",
    "“Building a healthy entertainment ecosystem where technology and art harmonize.”": "“기술과 예술이 조화를 이루는 건강한 엔터테인먼트 생태계 구축.”",
    "The BDF token is a BEP-20 asset issued on the BSC (Binance Smart Chain) network. Block Label leverages BSC's high throughput, low fees, and proven security to bring entertainment IP and the fan economy on-chain — contributing to the expansion of real-world use cases within the BSC ecosystem.": "BDF 토큰은 BSC(바이낸스 스마트 체인) 네트워크에서 발행된 BEP-20 자산입니다. Block Label은 엔터테인먼트 IP와 팬 경제를 온체인으로 가져오기 위해 BSC의 높은 처리량, 낮은 수수료 및 입증된 보안을 활용하여 BSC 생태계 내에서 실제 사용 사례 확장에 기여합니다.",
    "Fan Participation": "팬 참여",
    "We redefine fans as co-creators of the ecosystem rather than mere consumers. Through Fan DAO governance, fans directly participate in artist curation, content planning, and IP strategy, and earn rewards proportional to their contribution—building a new fandom economy.": "우리는 팬을 단순한 소비자가 아닌 생태계의 공동 창작자로 재정의합니다. 팬 DAO 거버넌스를 통해 팬은 아티스트 큐레이션, 콘텐츠 기획, IP 전략에 직접 참여하고 기여도에 비례하는 보상을 받아 새로운 팬덤 경제를 구축합니다.",
    "Fan DAO governance voting": "팬 DAO 거버넌스 투표",
    "Participatory content planning": "참여형 콘텐츠 기획",
    "Contribution-based rewards": "기여 기반 보상",
    "Global Expansion": "글로벌 확장",
    "Leveraging the global competitiveness of K-content, we deploy music, short dramas, and transmedia IPs simultaneously across international OTT platforms, global film festivals, and overseas licensing channels. Multilingual localization and blockchain-based global settlement enable a borderless IP business.": "K-콘텐츠의 글로벌 경쟁력을 활용하여 글로벌 OTT 플랫폼, 글로벌 영화제, 해외 라이선싱 채널에 음악, 숏드라마, 트랜스미디어 IP를 동시 배포합니다. 다국어 현지화와 블록체인 기반 글로벌 정산으로 국경 없는 IP 비즈니스를 실현합니다.",
    "Simultaneous global OTT distribution": "동시 글로벌 OTT 배포",
    "Multilingual localization": "다국어 현지화",
    "Borderless on-chain settlement": "국경 없는 온체인 정산",
    "BEP-20 standard token issuance": "BEP-20 표준 토큰 발행",
    "Issuing the BDF token under the BSC standard ensures broad compatibility and liquidity.": "BSC 표준에 따라 BDF 토큰을 발행하여 광범위한 호환성과 유동성을 보장합니다.",
    "Entertainment dApp reference": "엔터테인먼트 dApp 참조",
    "AI content production, IP protection, and Fan DAOs expand real-world use cases within the BSC ecosystem.": "AI 콘텐츠 제작, IP 보호, 팬 DAO는 BSC 생태계 내에서 실제 사용 사례를 확장합니다.",
    "Operated on BSC infrastructure": "BSC 인프라에서 운영됨",
    "Smart contracts, DAOs, and airdrops are executed transparently and efficiently on top of BSC.": "스마트 컨트랙트, DAO, 에어드롭은 BSC 위에서 투명하고 효율적으로 실행됩니다.",
    "Transparency": "투명성",
    "All smart contracts are public and auditable on BscScan.": "모든 스마트 컨트랙트는 BscScan에서 공개되고 감사 가능합니다.",
    "Community": "커뮤니티",
    "Built by the community, for the community.": "커뮤니티에 의해, 커뮤니티를 위해 구축되었습니다.",
    "Innovation": "혁신",
    "A rules-based buyback & burn tied to real IP value growth.": "실제 IP 가치 성장과 연계된 규칙 기반 바이백 및 소각.",
    "Security": "보안",
    "Multi-audited smart contracts protect every user.": "다중 감사를 거친 스마트 컨트랙트가 모든 사용자를 보호합니다.",
    "Fan DAO Community": "팬 DAO 커뮤니티",
    "Creator DAO": "크리에이터 DAO",
    "Team (locked · burn-linked)": "팀 (잠금 · 소각 연계)",
    "Ecosystem Fund": "생태계 펀드",
    "Early Participants": "초기 참여자",
    "General DAO": "제너럴 DAO",
    "Core Product Development": "핵심 제품 개발",
    "Emergency Fund": "긴급 자금",
    "Marketing": "마케팅",
    "Governance": "거버넌스"
}

with open('src/lib/i18n.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = []
for k, v in missing.items():
    if f'"{k.split("·")[0].split("&")[0].strip()}":' not in content and f'"{k}":' not in content:
        lines.append(f'  "{k}": "{v}",')

if lines:
    block = '\n' + '\n'.join(lines) + '\n'
    content = content.replace('};\n\nexport function I18nProvider', block + '};\n\nexport function I18nProvider')
    with open('src/lib/i18n.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Added {len(lines)} missing translations for about.tsx!")
else:
    print("Already present.")
