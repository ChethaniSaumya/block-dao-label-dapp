import json

missing = {
    "A next-generation entertainment and technology company combining AI and blockchain — building a healthy ecosystem where technology and art work together.": "AI와 블록체인을 결합한 차세대 엔터테인먼트 및 기술 기업 — 기술과 예술이 조화를 이루는 건강한 생태계를 구축합니다.",
    "Everything above is editable on-chain by the Safe. The only one-way rules: the supply cap can be lowered but never raised, and a serial is issued at most once — burning does not release it.": "위의 모든 내용은 Safe를 통해 온체인에서 편집할 수 있습니다. 유일한 단방향 규칙: 공급 상한은 낮출 수만 있으며 절대 올릴 수 없고, 일련번호는 최대 한 번만 발행됩니다 — 소각하더라도 재발행되지 않습니다.",
    "This is an independent project built on the BSC (Binance Smart Chain) network. While we currently have no capital or equity ties with Binance or its affiliates, we are actively pursuing strategic collaborations and partnerships with projects across the BSC ecosystem going forward.": "이 프로젝트는 BSC(바이낸스 스마트 체인) 네트워크를 기반으로 구축된 독립 프로젝트입니다. 현재 바이낸스 또는 그 계열사와 자본이나 지분 관계는 없지만, 향후 BSC 생태계 전반의 프로젝트들과 전략적 협력 및 파트너십을 적극적으로 추진하고 있습니다.",
    "50% of supply is community-allocated (Fan DAO + Creator DAO). Team tokens are locked in a Team Vault and released only when the 50% burn milestone is reached, with pro-rata burn applied.": "공급량의 50%는 커뮤니티(팬 DAO + 크리에이터 DAO)에 할당됩니다. 팀 토큰은 팀 금고에 잠겨 있으며, 50% 소각 목표에 도달했을 때만 비례 소각이 적용되어 해제됩니다.",
    "Your Block Label Creator DAO Certificates. Each certificate carries a unique serial number, an allocated {{SYMBOL}} airdrop, and access to the IP wholesale market.": "귀하의 블록 라벨 크리에이터 DAO 인증서입니다. 각 인증서에는 고유한 일련번호, 할당된 {{SYMBOL}} 에어드롭, IP 도매 시장에 대한 접근 권한이 포함되어 있습니다.",
    "Deploy the collection, then set VITE_CERTIFICATE_NFT_ADDRESS in the environment to enable this console.": "컬렉션을 배포한 다음 이 콘솔을 활성화하려면 환경에서 VITE_CERTIFICATE_NFT_ADDRESS를 설정하십시오.",
    "This console is limited to the operations wallet (issuance) and the Safe multisig (configuration).": "이 콘솔은 운영 지갑(발행)과 Safe 멀티시그(구성)로 제한됩니다.",
    "Progress assumes sequential issuance; serials issued out of order are not reflected in the bars.": "진행률은 순차적 발행을 가정합니다; 순서 없이 발행된 일련번호는 막대에 반영되지 않습니다.",
    "Use when the buyer must receive the number printed on their physical certificate.": "구매자가 실제 인증서에 인쇄된 번호를 받아야 할 때 사용합니다.",
    "Mint a run of consecutive serials to one wallet (e.g. the Safe) to hold as stock.": "한 지갑(예: Safe)에 연속된 일련번호를 발행하여 재고로 보유합니다.",
    "Read-only — these actions require the Safe multisig, not the operations wallet.": "읽기 전용 — 이러한 작업은 운영 지갑이 아닌 Safe 멀티시그를 요구합니다.",
    "Affects on-chain display only — regenerate the metadata to match.": "온체인 표시에만 영향을 미칩니다 — 일치하도록 메타데이터를 다시 생성하십시오.",
    "Serial ranges must ascend and must not overlap. Gaps are allowed — a serial no round covers simply has no allocation.": "일련번호 범위는 오름차순이어야 하며 겹치지 않아야 합니다. 공백은 허용됩니다 — 어떤 라운드에도 포함되지 않는 일련번호는 할당량이 없습니다.",
    "We never store your private keys. All transactions are signed locally.": "당사는 귀하의 개인 키를 저장하지 않습니다. 모든 트랜잭션은 로컬에서 서명됩니다.",
    "Skip to demo dashboard →": "데모 대시보드로 건너뛰기 →",
    "Ownership verified on-chain. You can browse and purchase IP wholesale products.": "온체인에서 소유권이 확인되었습니다. IP 도매 상품을 검색하고 구매할 수 있습니다.",
    "This wallet holds no Creator DAO Certificate. Certificates are issued by the Foundation once your order is confirmed.": "이 지갑에는 크리에이터 DAO 인증서가 없습니다. 주문이 확인되면 재단에서 인증서를 발행합니다.",
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
    print(f"Added {len(lines)} missing multiline translations!")
else:
    print("Already present.")
