import json

missing_translations = {
    "CORPORATE STRUCTURE & TOKEN CLASSIFICATION NOTICE": "법인 구조 및 토큰 분류에 관한 공지",
    "Block DAO Foundation (the 'Foundation'), the issuer of the BDF token, is a non-profit foundation located overseas, and is a completely separate and independent legal entity from Block Label Co., Ltd. (the Korean corporation). The two organizations operate the IP content business and the token economy business independently, with no debt or liability relationship between them.\\n\\nAll blockchain-related businesses, including BDF token issuance, token economy operations, and DAO governance, are managed and operated by the Foundation. The BDF token information provided on this website is for reference purposes only regarding the Foundation's project.\\n\\nThe BDF token is a utility token intended solely for purchasing NFT products and gift certificates (including gift cards) offered by the Foundation. Under no circumstances does this token possess the characteristics of currency, legal tender, electronic money, payment instruments, deposits, bonds, securities, investment contracts, derivatives, or any equivalent financial instruments. Mere holding of the token does not guarantee interest, dividends, principal protection, or investment returns. Therefore, trading or exchanging this token shall not be considered an investment activity, and it is not classified as a security under applicable laws.": "BDF 토큰의 발행처인 Block DAO Foundation(이하 '재단')은 해외에 소재한 비영리 재단으로, 주식회사 블록레이블(한국 법인)과는 완전히 분리된 독립적인 법인입니다. 두 기관은 채무나 부채 관계 없이 IP 콘텐츠 사업과 토큰 이코노미 사업을 독립적으로 운영합니다.\\n\\nBDF 토큰 발행, 토큰 이코노미 운영, DAO 거버넌스를 포함한 모든 블록체인 관련 사업은 재단이 관리하고 운영합니다. 본 웹사이트에 제공된 BDF 토큰 정보는 재단의 프로젝트에 대한 참고용으로만 제공됩니다.\\n\\nBDF 토큰은 재단이 제공하는 NFT 상품 및 상품권(기프트 카드 포함) 구매만을 위한 유틸리티 토큰입니다. 어떠한 경우에도 이 토큰은 통화, 법정화폐, 전자 화폐, 지급 수단, 예금, 채권, 증권, 투자 계약, 파생 상품 또는 그에 상응하는 금융 상품의 특성을 갖지 않습니다. 토큰을 단순히 보유하는 것만으로는 이자, 배당, 원금 보장 또는 투자 수익을 보장하지 않습니다. 따라서 이 토큰을 거래하거나 교환하는 것은 투자 활동으로 간주되지 않으며 해당 법률에 따라 증권으로 분류되지 않습니다.",
    "FREQUENTLY ASKED QUESTIONS (FAQ)": "자주 묻는 질문 (FAQ)",
    "BLOCK LABEL · OFFICIAL": "BLOCK LABEL · 공식",
    "NOTICE #001 · MAY 12, 2026": "NOTICE #001 · 2026.05.12",
    "Demo Sourcing for New Artists & A&R Team Inquiries": "신인 아티스트 데모 소싱 및 A&R 팀 문의",
    "NOTICE #002 · APR 1, 2026": "NOTICE #002 · 2026.04.01",
    "Block Label Official Website Launch": "Block Label 공식 웹사이트 오픈",
    "DEALER CONTRACT CONSULTATION REQUEST": "대리점 계약 상담 신청",
    "We are recruiting partners to join as regional dealers. Our team will personally guide you through the revenue structure and contract process of the tablet · AI education business.": "지역 대리점으로 함께할 파트너를 모집합니다. 태블릿·AI 교육 사업의 수익 구조와 계약 절차를 전담 매니저가 1:1로 직접 안내해 드립니다.",
    "PARTNER BENEFITS": "파트너 혜택",
    "BENEFITS FOR DEALERS": "대리점 혜택",
    "Exclusive Regional Operation": "지역 독점 영업권",
    "Regional dealer authority and sales support.": "해당 지역의 대리점 권한 및 영업 지원.",
    "Multi-layer Revenue Structure": "다중 수익 구조",
    "Sales margin · monthly fees · referral rewards.": "판매 마진 · 월정액 수익 · 추천 보상.",
    "HQ Training Support": "본사 교육 지원",
    "AI education content and operations manuals provided.": "AI 교육 콘텐츠 및 운영 매뉴얼 제공.",
    "Referral Reward System": "추천 보상 시스템",
    "5% of directly referred dealer's revenue.": "직접 추천한 대리점 매출의 5%.",
    "Growth Roadmap": "성장 로드맵",
    "Business expansion linked with flagship store growth.": "플래그십 스토어 성장과 연계된 사업 확장.",
    "DEALER SUPPORT": "대리점 지원",
    "Dealer Support Program": "대리점 지원 프로그램",
    "Block Label provides practical support for the stable operation and growth of regional dealers.": "Block Label은 지역 대리점의 안정적인 운영과 성장을 위해 실질적인 지원을 제공합니다.",
    "Performance Bonus": "성과 보너스",
    "Top-performing dealers receive bonuses from the contribution pool funded by 5% of total qualified sales.": "우수 대리점에게는 자격이 되는 총 매출의 5%로 조성된 기여 풀에서 보너스가 지급됩니다.",
    "Monthly Local Marketing Budget": "월간 지역 마케팅 예산",
    "Monthly marketing support for local promotion and customer acquisition.": "지역 홍보 및 고객 유치를 위한 월별 마케팅 지원.",
    "Full-Time Career Path at Direct Stores": "직영점 정규직 전환 기회",
    "Outstanding dealers gain opportunities to run direct stores and full-time employment.": "우수 대리점주에게는 직영점 운영 및 정규직 채용 기회가 부여됩니다.",
    "Business Cards, Flyers, Banners & Business Kit": "명함, 전단지, 배너 및 비즈니스 키트",
    "Headquarters produces and supplies branded print materials and business kits.": "본사에서 브랜드 홍보물 및 비즈니스 키트를 제작하여 제공합니다.",
    "4 Steps to Contract": "계약까지 4단계",
    "4 STEPS TO CONTRACT": "계약까지 4단계",
    "Consultation Request": "상담 신청",
    "Submit the form below and a manager will contact you within 1-2 business days.": "아래 양식을 제출하시면 영업일 기준 1~2일 내에 담당자가 연락드립니다.",
    "Business Briefing · Due Diligence": "사업 설명 · 입지 분석",
    "One-on-one guidance on the revenue structure, regional status, and operations.": "수익 구조, 지역 현황 및 운영에 대한 1:1 안내.",
    "Contract Signing": "계약 체결",
    "Complete regional assignment and contract, and receive your dealer code.": "지역 배정 및 계약을 완료하고 대리점 코드를 발급받습니다.",
    "Launch · Operations Support": "오픈 · 운영 지원",
    "Start business with training content, devices, and operations manuals.": "교육 콘텐츠, 기기 및 운영 매뉴얼로 사업을 시작하세요.",
    "Request Tablet Consultation": "태블릿 구매 상담",
    "Dealer Contract Consultation": "대리점 계약 상담",
    "Purchase a tablet PC and get 3 years of online/offline AI education, content creation, monetization, contests, and job connections.": "태블릿 PC를 구매하고 3년간 온/오프라인 AI 교육, 콘텐츠 제작, 수익화, 공모전, 취업 연계를 받으세요.",
    "GET YOUR TABLET PC FOR FREE": "태블릿 PC 무료 제공 혜택",
    "While taking AI classes for 3 years, certify 6 months of revenue on MORIPE and your tablet PC becomes free!": "3년 동안 AI 강의를 들으면서 MORIPE에서 6개월 수익을 인증하면 태블릿 PC가 무료가 됩니다!",
    "AI ECONOMIC ACTIVITY SCHOLARSHIP": "AI 경제 활동 장학금",
    "AI Economic Activity Scholarship Program": "AI 경제 활동 장학 프로그램",
    "If you certify at least ₩100,000 in monthly content sales for 6 consecutive months, you can receive a ₩1.49M scholarship.": "6개월 연속 월 10만원 이상의 콘텐츠 매출을 인증하면 149만원의 장학금을 받을 수 있습니다.",
    "TABLET PC + 3-YEAR AI EDUCATION (WORTH AT LEAST ₩1.5M)": "태블릿 PC + 3년 AI 교육 (최소 150만원 가치)",
    "Take the courses, create educational content, animation, monetizable shorts, short dramas, web novels, webtoons, films, and books, start distributing, and realize monetization!": "강의를 듣고 교육 콘텐츠, 애니메이션, 수익화 쇼츠, 숏드라마, 웹소설, 웹툰, 영화, 책을 만들고 배포를 시작하여 수익화를 실현하세요!",
    "1 Year of Education": "1년 교육과정",
    "Content Creation": "콘텐츠 제작",
    "Monthly Challenge": "월간 챌린지",
    "Full Participation": "전면 참여",
    "Monetization Opportunities": "수익화 기회",
    "Every Time 800 Tablets Are Sold, the Education Infrastructure Expands Together": "태블릿이 800대 판매될 때마다 교육 인프라가 함께 확장됩니다",
    "New Flagship Stores": "신규 플래그십 스토어",
    "Flagship stores start opening in student-dense areas.": "학생 밀집 지역에 플래그십 스토어가 오픈하기 시작합니다.",
    "Expanded Curriculum": "확장된 커리큘럼",
    "3 additional expert online lectures produced.": "전문가 온라인 강의 3개가 추가로 제작됩니다.",
    "Dedicated Instructors": "전담 강사",
    "1 resident instructor assigned per flagship store.": "플래그십 스토어당 1명의 상주 강사가 배정됩니다.",
    "Local Access": "오프라인 접근성",
    "Access to paid and free education from local dealers.": "지역 대리점을 통해 유/무료 교육에 접근할 수 있습니다.",
    "FROM DEVICE TO CAREER": "기기에서 경력으로",
    "4 Stages Completed With a Single Purchase": "단 한 번의 구매로 완성되는 4단계",
    "Receive a Samsung Galaxy Tab 11+": "최신 삼성 갤럭시 탭 11+ 수령",
    "Receive the latest tablet, optimized for learning and content creation, as part of your purchase.": "학습 및 콘텐츠 제작에 최적화된 최신 태블릿을 수령합니다.",
    "Online/Offline AI Education (Worth at least ₩1.5M)": "온/오프라인 AI 교육 (최소 150만원 상당)",
    "Learn hands-on content-creation skills directly from AI professionals over 3 years of training.": "3년간 AI 전문가로부터 직접 실무 콘텐츠 제작 기술을 배웁니다.",
    "Monetize What You Learn Right Away · Enter Contests": "배운 것을 즉시 수익화하세요 · 공모전 참가",
    "Put your new skills to work immediately through contests, brand collaborations, and monthly challenges.": "공모전, 브랜드 협업, 월간 챌린지를 통해 새로운 기술을 즉시 활용하세요.",
    "Hiring and Project Connections for Top Graduates": "우수 수료생 채용 및 프로젝트 연계",
    "Outstanding graduates are connected to real project opportunities and hiring pipelines with partner companies.": "우수 수료생은 파트너 기업의 실제 프로젝트 기회 및 채용 파이프라인과 연결됩니다.",
    "Want to Partner With Us as a Business?": "사업 파트너로 함께하시겠습니까?",
    "If you're interested in operating as a regional dealer, sales representative, or educational partner, we'll guide you through the details.": "지역 대리점, 영업 대표 또는 교육 파트너로 운영하는 데 관심이 있으시다면 세부 사항을 안내해 드립니다.",
    "Apply for Dealer Consultation": "대리점 상담 신청",
    "Find a Dealer Near Me": "가까운 대리점 찾기",
    "Name": "이름",
    "Phone Number (Mobile)": "휴대폰 번호",
    "Email (optional)": "이메일 (선택)",
    "Preferred Region (City / District)": "희망 지역 (시 / 구·군)",
    "Business type": "사업자 유형",
    "Expected Investment Scale": "예상 투자 규모",
    "Referral Code (optional)": "추천인 코드 (선택)",
    "Message (Optional)": "문의 내용 (선택)",
    "[Required] I consent to the collection and use of personal information.": "[필수] 개인정보 수집 및 이용에 동의합니다.",
    "[Required] I confirm I am 14 or older (16 or older for EU/EEA residents). Minors require consent from a legal guardian.": "[필수] 만 14세 이상임을 확인합니다 (만 14세 미만은 법정대리인 동의 필요).",
    "[Optional] I consent to receive marketing information such as business briefings and promotions.": "[선택] 사업 설명회 및 프로모션 등 마케팅 정보 수신에 동의합니다.",
    "Get the Latest Samsung Galaxy Tab 11+, Learn AI, and Try Monetizing It": "최신 SAMSUNG 갤럭시 탭 11+ 태블릿 PC도 받고, AI도 배우고, 수익화도 도전하자"
}

with open('src/lib/i18n.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Generate the block of lines to insert
lines = ["  // --- Additional Dynamic Page Restorations ---"]
for k, v in missing_translations.items():
    # Escape quotes
    k_escaped = k.replace('"', '\\"').replace('\\n', '\\\\n')
    v_escaped = v.replace('"', '\\"').replace('\\n', '\\\\n')
    lines.append(f'  "{k_escaped}": "{v_escaped}",')

block = "\\n".join(lines) + "\\n};"

content = content.replace("};", block, 1)

with open('src/lib/i18n.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
