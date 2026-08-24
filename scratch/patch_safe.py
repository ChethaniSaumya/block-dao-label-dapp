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
    escaped_m = m.replace('"', '\\"').replace('\n', '\\n')
    if f'"{escaped_m}":' not in i18n_content and f'{m}:' not in i18n_content:
        missing.append(m)

# provide translations
translations = {
    "support@block-label.com": "support@block-label.com",
    "business@block-label.com": "business@block-label.com",
    "anrteam@block-label.com": "anrteam@block-label.com",
    "John Doe": "홍길동",
    "name@example.com": "name@example.com",
    "010-0000-0000": "010-0000-0000",
    "Seoul": "서울",
    "Gangnam-gu": "강남구",
    "Phone": "연락처",
    "Business Type": "사업자 유형",
    "Area of Interest": "관심 분야",
    "Preferred Region (City)": "희망 지역 (시/도)",
    "Preferred Region (District)": "희망 지역 (구/군)",
    "Region of Residence (City · District)": "거주 지역 (시/구)",
    "REFERRER CODE": "추천인 코드",
    "Feel free to share your operating experience, desired start date, or any questions.": "운영 경험, 희망 시작일 또는 기타 질문을 자유롭게 남겨주세요.",
    
    "Submit Dealer Consultation Request": "대리점 상담 신청하기",
    "Submit Tablet Consultation Request": "태블릿 상담 신청하기",
    "Dealer Contract Consultation Request": "대리점 계약 상담 신청",
    "Tablet Purchase Inquiry": "태블릿 구매 문의",
    
    "1. Data Controller": "1. 개인정보처리자",
    "Block Label Korea Co., Ltd. · Main line 1577-3204 · Privacy inquiries: Contact page": "블록레이블(주) · 대표번호 1577-3204 · 프라이버시 문의: 문의 페이지",
    "2. Items Collected": "2. 수집 항목",
    "[Required] Name, phone number · [Optional] Email, preferred region, business type, expected investment scale, message · [Automatically collected] Access information (User-Agent, submission time)": "[필수] 이름, 연락처 · [선택] 이메일, 희망지역, 사업자유형, 예상투자규모, 문의내용 · [자동수집] 접속정보 (User-Agent, 제출시간)",
    "3. Purpose of Collection · Legal Basis": "3. 수집 목적 · 법적 근거",
    "Dealer contract consultation and guidance, provision of business briefing materials, and service improvement, processed on the basis of your consent below.": "대리점 계약 상담 및 안내, 사업 설명 자료 제공, 서비스 개선 (아래 동의를 기반으로 처리됨)",
    
    "[Required] I am 14 years of age or older.": "[필수] 만 14세 이상입니다.",
    "[Optional] I consent to receive marketing and promotional information.": "[선택] 마케팅 및 프로모션 정보 수신에 동의합니다.",
    
    "For Customers": "고객용",
    "For Business Partners": "비즈니스 파트너용",
    "We guide you 1:1 through regional dealer recruitment, the revenue structure of sales margin, subscriptions and referral rewards, and the contract process.": "지역 대리점 모집, 판매 마진, 구독 및 추천 보상의 수익 구조, 계약 절차를 1:1로 안내해 드립니다.",
    "Buy a tablet PC and get 3 years of online/offline AI education (worth at least KRW 1.5M), content production, monetization, contests and job connections.": "태블릿 PC를 구매하고 3년간 온/오프라인 AI 교육 (최소 150만원 상당), 콘텐츠 제작, 수익화, 공모전 및 취업 연계를 받으세요.",
    
    "Job Board": "채용 게시판",
    "Benefits for Dealers": "대리점 혜택",
    "Get Your Tablet PC for Free": "태블릿 PC 무료로 받기",
    "Corporate Structure & Token Classification Notice": "법인 구조 및 토큰 분류 공지",
    "Guidance on the legal nature of the BDF token.": "BDF 토큰의 법적 성격에 대한 안내.",
    "Frequently Asked Questions (FAQ)": "자주 묻는 질문 (FAQ)",
    "FOUNDATION": "재단",
    "INFRASTRUCTURE": "인프라스트럭처",
    
    "Q1. Is the BDF token a currency?": "Q1. BDF 토큰은 통화인가요?",
    "No. The BDF token is not legal tender, electronic money, or a payment instrument. For example, unlike KRW or USD, it cannot be used to pay for everyday goods or services. It is a limited utility token usable only for purchasing NFT products and gift certificates offered by the Foundation.": "아니요. BDF 토큰은 법정화폐, 전자화폐 또는 지급수단이 아닙니다. 예를 들어 원화(KRW)나 달러(USD)와 달리 일상적인 상품이나 서비스 결제에 사용할 수 없습니다. 재단이 제공하는 NFT 상품 및 상품권 구매 용도로만 사용 가능한 제한적 유틸리티 토큰입니다.",
    "Q2. Is the BDF token a security?": "Q2. BDF 토큰은 증권인가요?",
    "No. The BDF token does not qualify as a security, investment contract, or derivative under capital markets law. For example, unlike a stock, mere holding of the token does not grant equity, voting rights as a shareholder, dividends, interest, principal protection, or any promise of future returns. Holding the token does not guarantee any investment returns.": "아니요. BDF 토큰은 자본시장법상 증권, 투자계약증권 또는 파생상품에 해당하지 않습니다. 주식과 달리 토큰을 보유한다고 해서 지분, 주주로서의 의결권, 배당금, 이자, 원금 보장 또는 미래 수익을 약속받지 않습니다. 토큰 보유는 어떠한 투자 수익도 보장하지 않습니다.",
    "Q3. Then what is the BDF token?": "Q3. 그렇다면 BDF 토큰은 무엇인가요?",
    "The BDF token is a utility token used solely within the Foundation's ecosystem. Examples: (1) purchasing Block Label IP-based NFT products (artist-limited NFTs, content NFTs, etc.), (2) purchasing gift certificates / gift cards issued by the Foundation, and (3) participating in DAO governance voting.": "BDF 토큰은 재단 생태계 내에서만 사용되는 유틸리티 토큰입니다. 예: (1) Block Label IP 기반 NFT 상품(아티스트 한정판 NFT, 콘텐츠 NFT 등) 구매, (2) 재단이 발행하는 상품권/기프트카드 구매, (3) DAO 거버넌스 투표 참여.",
    "Q4. Does buying or selling the token constitute investment activity?": "Q4. 토큰을 사고파는 행위가 투자 활동에 해당하나요?",
    "No. The trading or exchange of BDF tokens is not regarded as investment activity, and is not classified as a securities transaction under applicable laws. The Foundation cannot control, predict, or guarantee market price fluctuations, and the user bears full responsibility for all transactions.": "아니요. BDF 토큰의 거래나 교환은 투자 활동으로 간주되지 않으며, 관련 법령상 증권 거래로 분류되지 않습니다. 재단은 시장 가격 변동을 통제, 예측 또는 보장할 수 없으며, 모든 거래에 대한 전적인 책임은 사용자에게 있습니다.",
    "Q5. Are Block Label Co., Ltd. and the Foundation the same company?": "Q5. 주식회사 블록레이블과 재단은 같은 회사인가요?",
    "No. They are completely separate and independent legal entities. Block Label Co., Ltd. is a Korean stock corporation that operates music/video/IP production and content businesses, while Block DAO Foundation is a separate non-profit foundation located overseas that handles token issuance and DAO governance. The two are separated in capital structure, governance, and decision-making.": "아니요. 두 기관은 완전히 분리된 독립 법인입니다. 주식회사 블록레이블은 음악/영상/IP 제작 및 콘텐츠 사업을 영위하는 한국의 주식회사이며, Block DAO Foundation은 토큰 발행과 DAO 거버넌스를 담당하는 해외 소재의 독립적인 비영리 재단입니다. 양사는 자본 구조, 거버넌스, 의사결정 면에서 철저히 분리되어 있습니다.",
    
    "NOTICE #001 · May 12, 2026": "NOTICE #001 · 2026.05.12",
    "NOTICE #002 · Apr 1, 2026": "NOTICE #002 · 2026.04.01",
    
    "BDF is a shared utility token used within the Block Label ecosystem, usable by anyone regardless of NFT certificate ownership. However, NFT certificate holders are additionally granted the right to mine BDF. It does not promise returns or represent securities rights.": "BDF는 NFT 증서 보유 여부와 관계없이 누구나 사용할 수 있는 Block Label 생태계 내 공용 유틸리티 토큰입니다. 단, NFT 증서 보유자에게는 BDF 채굴 권한이 추가로 부여됩니다. 이는 수익을 보장하거나 증권적 권리를 의미하지 않습니다."
}

lines = ["  // --- Remaining translations ---"]
for m in missing:
    kr_str = translations.get(m, m)
    
    escaped_m = m.replace('"', '\\"').replace('\n', '\\n').replace('\u2026', '...')
    escaped_kr = kr_str.replace('"', '\\"').replace('\n', '\\n').replace('\u2026', '...')
    escaped_m = escaped_m.replace('\uFFFD', '·')
    
    lines.append(f'  "{escaped_m}": "{escaped_kr}",')

block = "\\n".join(lines) + "\\n"

kr_end_marker = '};\n\nexport function I18nProvider'

if kr_end_marker in i18n_content:
    content_new = i18n_content.replace(kr_end_marker, block + kr_end_marker)
    with open('src/lib/i18n.tsx', 'w', encoding='utf-8') as f:
        f.write(content_new)
    print('Patched successfully!')
else:
    print('Could not find kr_end_marker')
