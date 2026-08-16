import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { applyBrandTokens } from "./brand";

type Lang = "en" | "kr";
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (s: string) => string };

const I18nContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (s) => s,
});

/* ──────────────── Korean translations ──────────────── */
const kr: Record<string, string> = {
  /* ── Navbar ── */
  Home: "홈",
  Dashboard: "대시보드",
  Staking: "스테이킹",
  Airdrop: "에어드롭",
  About: "소개",
  DAO: "DAO",
  "Connect Wallet": "지갑 연결",

  /* ── Hero (index) ── */
  "Live on BNB Chain": "BNB 체인 운영 중",
  "The Future of": "탈중앙화",
  Decentralized: "커머스의",
  "Commerce.": "미래.",
  "{{BRAND}} ({{SYMBOL}}) is a BEP-20 utility token on BNB Chain, linked to the Block Label ecosystem through the Link2E mechanism — no ICO, no token sale.":
    "{{BRAND}}({{SYMBOL}})은 BNB 체인의 BEP-20 유틸리티 토큰으로, Link2E 메커니즘을 통해 Block Label 생태계와 연결됩니다 — ICO 없음, 토큰 세일 없음.",
  "Launch App": "앱 실행",
  "Join via Block Label": "Block Label 참여하기",
  "Learn More": "더 알아보기",
  "holders trust {{SYMBOL}}": "명의 홀더가 {{SYMBOL}}를 신뢰합니다",

  /* ── Block Label Invite Banner ── */
  "Join the Block Label Ecosystem via Link2E":
    "Link2E를 통해 Block Label 생태계에 참여하세요",
  "Stake on Block Label to qualify for automatic {{SYMBOL}} airdrops":
    "Block Label에서 스테이킹하여 자동 {{SYMBOL}} 에어드롭 자격을 얻으세요",
  "Copy Link": "링크 복사",
  "Invite link copied!": "초대 링크가 복사되었습니다!",
  "Join Block Label": "Block Label 참여",

  /* ── Stats ── */
  "Total Supply": "총 발행량",
  Holders: "홀더 수",
  "Token Contract": "토큰 컨트랙트",
  "Staking APY": "스테이킹 APY",

  /* ── How It Works ── */
  "Get Started": "시작하기",
  "How It Works": "이용 방법",
  "Three simple steps to receive {{SYMBOL}} tokens.":
    "{{SYMBOL}} 토큰을 받는 3가지 간단한 단계.",
  "Click the invite link and join Block Label via the Link2E code to enter the ecosystem.":
    "초대 링크를 클릭하고 Link2E 코드를 통해 Block Label에 참여하여 생태계에 들어오세요.",
  "Stake on Block Label": "Block Label에서 스테이킹",
  "Stake Block Label tokens on the Block Label platform to meet the staking threshold.":
    "Block Label 플랫폼에서 Block Label 토큰을 스테이킹하여 스테이킹 기준을 충족하세요.",
  "Receive {{SYMBOL}} Airdrop": "{{SYMBOL}} 에어드롭 수령",
  "Block Label's smart contract detects eligibility and airdrops {{SYMBOL}} to your wallet automatically.":
    "Block Label의 스마트 컨트랙트가 자격을 감지하고 {{SYMBOL}}를 자동으로 지갑에 에어드롭합니다.",
  Open: "열기",
  "Link your BNB Chain compatible wallet to begin.":
    "BNB 체인 호환 지갑을 연결하여 시작하세요.",
  "Stake & Qualify": "스테이킹 & 자격 확인",
  "Stake {{SYMBOL}} to qualify your wallet for distributions.":
    "{{SYMBOL}}를 스테이킹하여 배분 자격을 얻으세요.",
  "Claim Airdrop": "에어드롭 수령",
  "Receive {{SYMBOL}} automatically through smart contracts.":
    "스마트 컨트랙트를 통해 자동으로 {{SYMBOL}}를 받으세요.",

  /* ── Why Us ── */
  "Why Us": "왜 우리인가",
  "Built different.": "다르게 만들었습니다.",
  "Open Smart Contracts": "오픈 스마트 컨트랙트",
  "Every contract is public, auditable, and verifiable on BscScan.":
    "모든 컨트랙트는 BscScan에서 공개, 감사 및 검증 가능합니다.",
  "CertiK Audited": "CertiK 감사 완료",
  "Three independent audits ensure code integrity and security.":
    "3개의 독립 감사가 코드 무결성과 보안을 보장합니다.",
  "BNB Chain Native": "BNB 체인 네이티브",
  "Lightning-fast transactions with negligible fees on BSC.":
    "BSC에서 무시할 수 있는 수수료와 초고속 트랜잭션.",
  "Global & Multilingual": "글로벌 & 다국어",
  "Built for a global community — English and 한국어 from day one.":
    "처음부터 글로벌 커뮤니티를 위해 구축 — 영어와 한국어 지원.",

  /* ── Roadmap ── */
  "The Path": "로드맵",
  Roadmap: "로드맵",
  "Phase 1": "1단계",
  Infrastructure: "인프라",
  "Token deployment, CertiK audit (3x), and Block Label partner integration.":
    "토큰 배포, CertiK 감사 (3회) 및 Block Label 파트너 통합.",
  "Phase 2": "2단계",
  "DApp Launch": "DApp 출시",
  "Web app, wallet onboarding, Link2E airdrops, and Creator DAO.":
    "웹 앱, 지갑 온보딩, Link2E 에어드롭 및 Creator DAO.",
  "Phase 3": "3단계",
  "Market Expansion": "시장 확장",
  "Multi-language rollout, global partnerships, and exchange listings.":
    "다국어 출시, 글로벌 파트너십 및 거래소 상장.",

  /* ── CTA ── */
  "Ready to get": "시작할",
  "started?": "준비가 되셨나요?",
  "Join the Block Label ecosystem and receive {{SYMBOL}} airdrops automatically through Link2E.":
    "Block Label 생태계에 참여하고 Link2E를 통해 자동으로 {{SYMBOL}} 에어드롭을 받으세요.",
  "View Dashboard": "대시보드 보기",

  /* ── Dashboard ── */
  "{{SYMBOL}} Balance": "{{SYMBOL}} 잔액",
  "Staked Amount": "스테이킹 금액",
  "Claimable Airdrop": "수령 가능한 에어드롭",
  "BNB Balance": "BNB 잔액",
  Connected: "연결됨",
  "Token Price History": "토큰 가격 이력",
  "Recent Transactions": "최근 거래",
  "View All": "전체 보기",
  "Quick Actions": "빠른 작업",
  "Stake {{SYMBOL}}": "{{SYMBOL}} 스테이킹",
  Transfer: "전송",
  "Buy {{SYMBOL}}": "{{SYMBOL}} 구매",
  "Lock tokens to earn rewards": "토큰을 잠그고 보상을 받으세요",
  "Collect your earned tokens": "획득한 토큰을 수령하세요",
  "Send {{SYMBOL}} to another wallet": "다른 지갑으로 {{SYMBOL}}를 전송하세요",

  "Airdrop Claim": "에어드롭 수령",
  Stake: "스테이킹",
  Purchase: "구매",
  Unstake: "스테이킹 해제",
  Success: "성공",
  Pending: "대기 중",

  /* ── Staking page (Block Label status) ── */
  "Your Block Label Staking Status": "Block Label 스테이킹 현황",
  "This page shows your staking status in the Block Label ecosystem. To stake, visit the Block Label platform.":
    "이 페이지는 Block Label 생태계에서의 스테이킹 현황을 보여줍니다. 스테이킹하려면 Block Label 플랫폼을 방문하세요.",
  "Block Label Staked": "Block Label 스테이킹",
  "Minimum Required": "최소 요구량",
  "Eligibility Status": "자격 상태",
  "Eligible for {{SYMBOL}} Airdrop": "{{SYMBOL}} 에어드롭 자격 있음",
  "Progress to Silver Tier": "실버 티어까지 진행",
  "Go to Block Label to Stake": "Block Label에서 스테이킹하기",
  "View Block Label Contract": "Block Label 컨트랙트 보기",
  "Airdrop Reward Tiers": "에어드롭 보상 티어",
  "Minimum Block Label Stake": "최소 Block Label 스테이킹",
  "{{SYMBOL}} Airdrop Reward": "{{SYMBOL}} 에어드롭 보상",
  "How the Link2E Airdrop Mechanism Works":
    "Link2E 에어드롭 메커니즘 작동 방식",
  "Users stake Block Label tokens on the Block Label platform (app.blocklabel.vip). The Link2E mechanism monitors these stakes and automatically distributes {{SYMBOL}} tokens to qualified wallets once the staking threshold is met. No manual claiming is required — distribution is handled fully on-chain and is verifiable on BscScan.":
    "사용자는 Block Label 플랫폼(app.blocklabel.vip)에서 Block Label 토큰을 스테이킹합니다. Link2E 메커니즘이 이러한 스테이킹 현황을 모니터링하여, 스테이킹 기준이 충족되면 자격이 있는 지갑에 {{SYMBOL}} 토큰을 자동으로 배분합니다. 수동 수령이 필요 없으며, 배분은 완전히 온체인에서 투명하게 이루어집니다.",
  Bronze: "브론즈",
  Silver: "실버",
  Gold: "골드",
  Status: "상태",
  Eligible: "자격 있음",
  "Reward Tiers": "보상 티어",
  "Minimum Stake": "최소 스테이킹",
  Reward: "보상",
  "Stake More": "추가 스테이킹",
  "Staking & Eligibility": "스테이킹 & 자격",
  "Stake {{SYMBOL}} to qualify your wallet for airdrops via the Link2E mechanism.":
    "Link2E 메커니즘을 통해 에어드롭 자격을 얻기 위해 {{SYMBOL}}를 스테이킹하세요.",
  "Current Staked": "현재 스테이킹",
  "Staking qualifies your wallet for {{SYMBOL}} airdrops through the Link2E mechanism. Distributions are automatic and on-chain.":
    "스테이킹은 Link2E 메커니즘을 통해 {{SYMBOL}} 에어드롭 자격을 부여합니다. 배분은 자동으로 온체인에서 이루어집니다.",

  /* ── Airdrop page ── */
  "Airdrop Claims": "에어드롭 수령",
  "Wallets meeting staking conditions automatically receive {{SYMBOL}} through open smart contracts.":
    "스테이킹 조건을 충족하는 지갑은 오픈 스마트 컨트랙트를 통해 자동으로 {{SYMBOL}}를 받습니다.",
  "Wallet Status": "지갑 상태",
  "Next Airdrop": "다음 에어드롭",
  Claimable: "수령 가능",
  "Claim Now": "지금 수령",
  "Your 500 {{SYMBOL}} claim has been queued.":
    "500 {{SYMBOL}} 수령이 대기열에 추가되었습니다.",
  "Airdrop History": "에어드롭 내역",
  Claimed: "수령됨",
  "How Airdrops Work": "에어드롭 작동 방식",
  "Wallets that meet staking conditions automatically receive {{SYMBOL}} through open, audited smart contracts. There is no application process — qualification and distribution are fully on-chain via the Link2E mechanism.":
    "스테이킹 조건을 충족하는 지갑은 공개 감사된 스마트 컨트랙트를 통해 자동으로 {{SYMBOL}}를 받습니다. 신청 절차가 없으며, 자격과 배분은 Link2E 메커니즘을 통해 완전히 온체인에서 이루어집니다.",
  "{{SYMBOL}} Airdrop Distribution": "{{SYMBOL}} 에어드롭 배분",
  "Claim your allocated {{SYMBOL}} tokens based on your Link2E eligibility.":
    "Link2E 자격에 따라 할당된 {{SYMBOL}} 토큰을 수령하세요.",
  "Your Allocation": "할당량",
  "Next Distribution": "다음 배분",
  "Distributions Received": "수령한 배분",
  "Eligibility Score": "자격 점수",
  "Claim Available Airdrop": "에어드롭 수령하기",
  "Distribution Schedule": "배분 일정",
  Round: "라운드",
  Date: "날짜",
  Allocated: "할당됨",
  "Eligibility Criteria": "자격 기준",
  "Wallet connected to BNB Chain": "BNB 체인에 지갑 연결됨",
  "Minimum {{SYMBOL}} staked (5,000+)": "최소 {{SYMBOL}} 스테이킹 (5,000+)",
  "Link2E profile verified": "Link2E 프로필 인증됨",
  "Active in last 30 days": "최근 30일 이내 활동",

  /* ── Connect page ── */
  "Connect Your Wallet": "지갑을 연결하세요",
  "Connect a BNB Chain compatible wallet to access {{BRAND}} features":
    "{{BRAND}} 기능에 접근하기 위해 BNB 체인 호환 지갑을 연결하세요",
  MetaMask: "MetaMask",
  "Trust Wallet": "Trust Wallet",
  WalletConnect: "WalletConnect",
  "Verify Eligibility": "자격 확인",
  "Access Dashboard": "대시보드 접근",
  "We never store your private keys. All transactions are signed locally.":
    "저희는 개인 키를 저장하지 않습니다. 모든 거래는 로컬에서 서명됩니다.",
  "Skip to demo dashboard →": "데모 대시보드로 이동 →",
  "Wallet Connected": "지갑 연결됨",
  "Switch to correct network": "올바른 네트워크로 전환",
  "Go to Dashboard": "대시보드로 이동",

  /* ── WalletGuard ── */
  "Wallet Required": "지갑 연결 필요",
  "Connect a BNB Chain compatible wallet to access this page.":
    "이 페이지에 접근하려면 BNB 체인 호환 지갑을 연결하세요.",

  /* ── About page ── */
  "About {{BRAND}}": "{{BRAND}} 소개",
  "What is {{BRAND}}?": "{{BRAND}}이란?",
  "{{BRAND}} ({{SYMBOL}}) is a BEP-20 utility token built on BNB Chain, linked to the Block Label ecosystem through the Link2E mechanism. Tokens are distributed to wallets that meet staking conditions — there is no token sale and no ICO. Distribution is fully on-chain, transparent, and verifiable.":
    "{{BRAND}}({{SYMBOL}})은 BNB 체인에 구축된 BEP-20 유틸리티 토큰으로, Link2E 메커니즘을 통해 Block Label 생태계와 연결됩니다. 토큰은 스테이킹 조건을 충족하는 지갑에 배분됩니다 — 토큰 세일이나 ICO는 없습니다. 배분은 완전히 온체인에서 투명하고 검증 가능하게 이루어집니다.",
  "{{BRAND}} provides access to the Creator DAO governance system. Block Label users who stake and meet eligibility conditions receive {{SYMBOL}} airdrops automatically.":
    "{{BRAND}}은 Creator DAO 거버넌스 시스템에 대한 접근을 제공합니다. 스테이킹하고 자격 조건을 충족하는 Block Label 사용자는 자동으로 {{SYMBOL}} 에어드롭을 받습니다.",
  "Key Facts": "주요 사실",
  "Token Standard": "토큰 표준",
  Chain: "체인",
  Contract: "컨트랙트",
  Audit: "감사",
  "Core Values": "핵심 가치",
  Transparency: "투명성",
  "All smart contracts are public and auditable on BscScan.":
    "모든 스마트 컨트랙트는 BscScan에서 공개되고 감사 가능합니다.",
  Community: "커뮤니티",
  "Built by the community, for the community.":
    "커뮤니티에 의해, 커뮤니티를 위해 구축되었습니다.",
  Innovation: "혁신",
  "Pushing boundaries with Link2E technology.":
    "Link2E 기술로 한계를 넓히고 있습니다.",
  Security: "보안",
  "Multi-audited smart contracts protect every user.":
    "다중 감사를 받은 스마트 컨트랙트가 모든 사용자를 보호합니다.",
  Team: "팀",
  Resources: "리소스",
  Whitepaper: "백서",
  WhitePaper: "백서",
  "BscScan Contract": "BscScan 컨트랙트",
  "CertiK Audit Report": "CertiK 감사 보고서",
  "Block Label Platform": "Block Label 플랫폼",
  "Founder & Architect": "창립자 & 설계자",
  "Lead Smart Contract Engineer": "수석 스마트 컨트랙트 엔지니어",
  "Head of Ecosystem": "생태계 책임자",

  /* ── Profile page ── */
  "Profile & Settings": "프로필 & 설정",
  "Connected Wallet": "연결된 지갑",
  Disconnect: "연결 해제",
  "Wallet disconnected": "지갑 연결이 해제되었습니다",
  "Account Settings": "계정 설정",
  "Display Name": "표시 이름",
  "Preferred Language": "선호 언어",
  Notifications: "알림",
  "Airdrop Alerts": "에어드롭 알림",
  "Staking Reminders": "스테이킹 알림",
  "Price Alerts": "가격 알림",
  "Save Settings": "설정 저장",
  "Network Info": "네트워크 정보",
  Network: "네트워크",
  "Chain ID": "체인 ID",

  /* ── Referral page ── */
  "Link2E Referral Program": "Link2E 추천 프로그램",
  "Invite wallets to the {{BRAND}} ecosystem and earn rewards.":
    "{{BRAND}} 생태계에 지갑을 초대하고 보상을 받으세요.",
  "Your Referral Link": "내 추천 링크",
  Copy: "복사",
  Share: "공유",
  "Total Referrals": "총 추천 수",
  "Rewards Earned": "보상 수익",
  "Pending Rewards": "대기 중인 보상",
  "Total Earned": "총 수익",
  "Referred Wallets": "추천된 지갑",
  "Wallet Address": "지갑 주소",
  "Join Date": "가입일",
  Active: "활성",

  /* ── Transactions page ── */
  "Transaction History": "거래 내역",
  "All your on-chain activity in one place.": "모든 온체인 활동을 한 곳에서.",
  "All Types": "전체 유형",
  "Search TX hash...": "TX 해시 검색...",
  "Download CSV": "CSV 다운로드",
  "TX Hash": "TX 해시",
  Type: "유형",
  Amount: "금액",

  /* ── Admin page ── */
  "Owner Panel": "관리자 패널",
  "OWNER ACCESS": "관리자 권한",
  "Access Denied": "접근 거부",
  "Only the owner wallet can access this panel.":
    "소유자 지갑만 이 패널에 접근할 수 있습니다.",
  "Token Controls": "토큰 제어",
  "Mint Tokens (amount)": "토큰 발행 (수량)",
  Mint: "발행",
  "Pause Contract": "컨트랙트 일시정지",
  Paused: "일시정지됨",
  "Transfer Ownership": "소유권 이전",
  "Airdrop Management": "에어드롭 관리",
  "Next Airdrop Date": "다음 에어드롭 날짜",
  "Minimum Staking Required": "최소 스테이킹 요구량",
  "Manual Airdrop": "수동 에어드롭",
  "Amount ({{SYMBOL}})": "수량 ({{SYMBOL}})",
  "Trigger Airdrop": "에어드롭 실행",
  "Stats Overview": "통계 개요",
  "Total Minted": "총 발행량",
  "Total Burned": "총 소각량",
  "Total Staked": "총 스테이킹",
  "Admin Logs": "관리 기록",
  Action: "작업",
  Wallet: "지갑",
  "Mint Tokens": "토큰 발행",
  "Update Min Stake": "최소 스테이킹 업데이트",

  /* ── Creator DAO page ── */
  "Creator DAO Account": "Creator DAO 계정",
  "DAO Creator": "DAO 크리에이터",
  "DAO Role": "DAO 역할",
  "Token Holdings": "토큰 보유량",
  "Votes Cast": "투표 참여",
  "Governance Proposals": "거버넌스 제안",
  ID: "ID",
  Proposal: "제안",
  Votes: "투표",
  Passed: "통과",
  Rejected: "거부",
  "Participation History": "참여 내역",
  Detail: "상세",
  "Submit Proposal": "제안 제출",
  "View on Block Label": "Block Label에서 보기",
  "Proposal Submitted": "제안 제출됨",
  "Community Vote": "커뮤니티 투표",
  "Content Creation": "콘텐츠 제작",
  "Bug Report": "버그 보고",
  Creator: "크리에이터",

  /* ── Language page ── */
  Language: "언어",
  "Language Settings": "언어 설정",
  "Choose your preferred display language.": "선호하는 표시 언어를 선택하세요.",
  "Current Language": "현재 언어",
  "More languages coming soon — Japanese, Chinese, Thai":
    "더 많은 언어가 곧 지원됩니다 — 일본어, 중국어, 태국어",
  "Apply Language": "언어 적용",
  English: "English",
  한국어: "한국어",
  Current: "현재",

  /* ── Footer ── */
  Terms: "이용약관",
  "Privacy Policy": "개인정보 처리방침",
  "{{BRAND}} is a partner project within the Block Label DePIN ecosystem on BNB Chain.":
    "{{BRAND}}은 BNB 체인의 Block Label DePIN 생태계 내 파트너 프로젝트입니다.",
  "A next-generation entertainment and technology company combining AI and blockchain — building a healthy ecosystem where technology and art work together.":
    "AI와 블록체인을 결합한 차세대 엔터테인먼트 · 기술 기업으로, 기술과 예술이 함께 어우러지는 건강한 생태계를 만들어갑니다.",
  "{{BRAND}} is built on the BNB Chain.": "{{BRAND}}는 BNB 체인 위에 구축되었습니다.",
  Enquiries: "문의",
  "All contact channels": "전체 문의 채널 보기",
  Company: "회사",
  Ecosystem: "생태계",
  Apply: "지원하기",
  "About Block Label": "회사 소개",

  /* ── Corporate content pages ──
     Korean transcribed verbatim from block-label.com's own bundle, paired
     with the English source strings in src/lib/site-content.ts. When adding
     a page there, add its translation here too, or a Korean toggle will
     silently fall back to English. */

  // Business Areas
  BUSINESS: "사업",
  "Business Areas": "사업분야",
  "A comprehensive content IP company spanning music, video and publishing.":
    "음악, 영상, 출판을 아우르는 종합 콘텐츠 IP 기업",
  "Core Business Areas": "핵심 사업 영역",
  "Music Production": "음악 프로덕션",
  "We oversee the full lifecycle of music IP — from discovering new artists through album production to global distribution — supporting artist growth with a dedicated management system.":
    "신인 아티스트 발굴부터 앨범 제작, 글로벌 유통까지 음악 IP의 전 과정을 총괄합니다. 전문 매니지먼트 시스템으로 아티스트의 성장을 지원합니다.",
  "Single & full album production · Global songwriter collaboration · Live event planning":
    "싱글·정규 앨범 제작 · 글로벌 작곡가 협업 · 라이브 공연 기획",
  "Short-Form Drama": "숏폼 드라마",
  "AI production technology cuts production costs by 90% while producing high-quality short dramas at scale — ultra-compressed, immersive one- to two-minute episodes.":
    "AI 제작 기술을 도입하여 제작비를 90% 절감하면서 고품질 숏드라마를 대량 제작합니다. 1~2분 에피소드의 초압축 몰입형 콘텐츠를 선보입니다.",
  "240+ titles in the short-drama lineup · AI hybrid production · OTT platform distribution":
    "240편+ 숏드라마 라인업 · AI 하이브리드 제작 · OTT 플랫폼 유통",
  "Transmedia IP": "트랜스미디어 IP",
  "We execute an OSMU (One Source Multi Use) strategy, expanding a single original IP into webtoons, web novels, short dramas, film and more.":
    "하나의 원천 IP를 웹툰, 웹소설, 숏드라마, 영화 등 다양한 형태로 확장하는 OSMU(One Source Multi Use) 전략을 실행합니다.",
  "30 webtoon titles / 4 web novels · Screen adaptation of original works · Global IP licensing":
    "웹툰 30편 / 웹소설 4편 · 원작 기반 영상화 · 글로벌 IP 라이선싱",
  "AI Video Showcase": "AI 영상 쇼케이스",
  "High-quality video produced with state-of-the-art AI technology is presented at international film festivals and technology showcases, demonstrating our capability to the world.":
    "최첨단 AI 기술로 제작한 고퀄리티 영상으로 글로벌 영화제와 기술 쇼케이스에 참가하며 기술력을 세계에 알립니다.",
  "Entries at international film festivals · AI technology showcases · Expanding brand awareness":
    "글로벌 영화제 출품 · AI 기술 쇼케이스 · 브랜드 인지도 확대",
  "CONTESTS & CHALLENGES": "공모전",
  "A Next-Generation Contest Model": "차세대 공모전 모델",
  "Block Label isn't just running contests — it's proposing a new content production model that directly connects demand (brands and small businesses) with supply (creators). Many creators take part in a single contest, producing multiple entries; an IP discovered this way can then expand step by step into advertising, AI video, short drama, OST, web novels and webtoons. Every participant is paid a participation fee, and outstanding entries receive additional prize money.":
    "Block Label은 단순한 공모전이 아닌, 수요자(브랜드·소상공인)와 공급자(창작자)가 직접 연결되는 새로운 콘텐츠 생산 모델을 제시합니다. 하나의 공모전에는 다수의 창작자가 참여해 여러 편의 결과물이 모이고, 여기서 발굴된 하나의 IP는 광고·AI 영상·숏드라마·OST·웹소설·웹툰으로 단계적으로 확장될 수 있습니다. 참여자 전원에게 참가비가 지급되고 우수 작품에는 추가 상금이 돌아갑니다.",
  "Advertising Contest": "광고 공모전",
  "Small businesses register an advertising budget, and creators produce short-form social video ads to enter. The 1st and 2nd place videos receive additional prize money.":
    "소상공인이 광고 예산을 등록하면 창작자들이 SNS용 쇼츠 광고 영상을 제작해 출품합니다. 1등·2등으로 뽑힌 영상에는 추가 상금이 지급됩니다.",
  "Social shorts · Brand promotion · Prize money": "SNS 쇼츠 · 브랜드 홍보 · 상금",
  "AI Video Contest": "AI 영상 공모전",
  "A contest for producing high-quality video content using AI production technology, with the chance to enter film festivals and technology showcases.":
    "AI 제작 기술을 활용해 고퀄리티 영상 콘텐츠를 만들어내는 공모전입니다. 영화제 출품 및 기술 쇼케이스 연계 기회를 제공합니다.",
  "AI-generated · Video production · Showcase": "AI 생성 · 영상 제작 · 쇼케이스",
  "Short-Form Drama Contest": "숏폼 드라마 공모전",
  "A contest for ultra-compressed one- to two-minute short drama scripts and videos. Outstanding entries lead to OTT platform distribution and full production.":
    "1~2분 에피소드의 초압축 숏드라마 시나리오와 영상을 공모합니다. 우수 작품은 OTT 플랫폼 유통 및 정식 제작으로 연결됩니다.",
  "Short drama · OTT · IP expansion": "숏드라마 · OTT · IP 확장",
  "OST · Music IP Contest": "OST · 뮤직 IP 공모전",
  "A contest for OST and music IP that fits a character and its world, discovering tracks that can grow into a story IP of their own.":
    "캐릭터와 세계관에 맞는 OST 및 뮤직 IP를 공모합니다. 트랙에서 출발하는 스토리 IP로 확장될 수 있는 작품을 발굴합니다.",
  "OST · Music IP · Character songs": "OST · 뮤직 IP · 캐릭터 송",
  "Web Novel · Webtoon Contest": "웹소설 · 웹툰 공모전",
  "A contest for creative work that can expand a single original IP into web novels and webtoons, selecting the works that become the starting point of the OSMU strategy.":
    "하나의 원천 IP를 웹소설과 웹툰으로 확장할 수 있는 창작물을 공모합니다. OSMU 전략의 시작점이 되는 작품을 선정합니다.",
  "Web novel · Webtoon · Original IP": "웹소설 · 웹툰 · 원작 IP",
  "Features of the Contest Model": "공모전 모델의 특징",
  "Guaranteed Participation Fee": "참가비 보장",
  "A fair compensation structure — every participant is paid a participation fee, regardless of whether their work is selected.":
    "선정 여부와 관계없이 참여자 전원에게 참가비가 지급되는 공정한 보상 구조입니다.",
  "IP Expansion Structure": "IP 확장 구조",
  "An OSMU structure in which a single IP expands into advertising, video, drama, music and literature.":
    "하나의 IP가 광고·영상·드라마·음악·문학으로 확장되는 OSMU 구조입니다.",
  "Direct Demand–Supply Connection": "수요-공급 직결",
  "Brands and creators meet directly on the platform, cutting intermediary costs and raising efficiency.":
    "브랜드와 창작자가 플랫폼에서 직접 만나 중개 비용을 줄이고 효율을 높입니다.",
  "Multiple Entries": "다수 참여",
  "Many creators take part in a single contest, so multiple entries can be compared and selected from.":
    "하나의 공모전에 다수의 창작자가 참여해 여러 편의 결과물을 비교·선택할 수 있습니다.",
  "Example: How an Advertising Contest Runs": "예시: 광고 공모전 운영 구조",
  "A small business registers a ₩500,000 advertising budget. 20 participants each receive a ₩10,000 participation fee to produce a short-form ad. An additional ₩200,000 first-place prize and ₩100,000 second-place prize are then paid out.":
    "소상공인이 50만원의 광고 예산을 등록하면 20명의 참여자가 각 1만원의 참가비를 받고 쇼츠 광고를 제작합니다. 1등 20만원, 2등 10만원의 상금이 추가로 지급됩니다.",
  "₩500,000": "50만원",
  "Example total ad budget": "예시 총 광고비",
  "20 people": "20명",
  "Participant fee headcount": "참여자 참가비",
  "₩200,000 / ₩100,000": "20만원 / 10만원",
  "1st / 2nd place prize": "1등 · 2등 상금",

  // Technology
  TECHNOLOGY: "기술",
  Technology: "기술혁신",
  "Technology Innovation": "기술 혁신",
  "Bringing efficiency and transparency to the entertainment industry with AI and blockchain.":
    "AI와 블록체인으로 엔터테인먼트 산업의 효율성과 투명성을",
  "Production cost reduction using AI": "AI 활용 제작비 절감",
  "10×+": "10배+",
  "IP output for the same budget": "동일 예산 대비 IP 생산량",
  "5–10×": "5~10배",
  "ROI versus traditional media": "기존 미디어 대비 ROI",
  "Core Technologies": "핵심 기술",
  "AI Production System": "AI 프로덕션 시스템",
  "Cuts production costs by 90% and secures more than ten times the IP output for the same budget.":
    "제작비를 90% 절감하고 동일 예산 대비 10배 이상의 IP를 확보합니다.",
  "Blockchain Copyright Protection": "블록체인 저작권 보호",
  "On-chain timestamping immutably records the moment of creation and the rights that come with it, with dual registration at KOMCA and the U.S. Copyright Office for global legal protection.":
    "온체인 타임스탬핑으로 창작 시점과 권리를 불변 기록하고, KOMCA 및 미국 저작권청 이중 등록으로 글로벌 법적 보호를 확보합니다.",
  "Smart Contract Settlement": "스마트 컨트랙트 정산",
  "Revenue is distributed automatically and transparently through smart contracts, turning a settlement process that traditionally took six to twelve months into a real-time one.":
    "스마트 컨트랙트를 통해 수익이 자동으로 투명하게 분배됩니다. 기존 6~12개월 걸리던 정산 과정을 실시간으로 혁신합니다.",
  "AI IP Valuation": "AI IP 밸류에이션",
  "An AI analysis engine estimates an IP's potential market value before production, by analysing comparable genre data and team metrics.":
    "AI 분석 엔진이 유사 장르 데이터와 참여 인력 지표를 분석하여 제작 전 IP의 잠재 시장 가치를 사전 산정합니다.",
  "PROTOCOL INNOVATION": "프로토콜 혁신",
  "The world's first next-generation non-custodial decentralized onboarding protocol. L-IDO never asks users to hand over control of their assets, even for a moment. Onboarding completes securely using only the user's own keys and a smart contract — no approval or custody from a centralized platform required.":
    "세계최초 차세대 비수탁형(Non-Custodial) 탈중앙화 온보딩 프로토콜. L-IDO는 사용자가 자산 통제권을 한순간도 양도하지 않는 비수탁형 온보딩 프로토콜입니다. 중앙화된 플랫폼의 승인이나 보관 없이, 사용자의 키와 스마트 컨트랙트만으로 안전하게 온보딩이 완료됩니다.",
  "Assets Held Directly": "자산 직접 보유",
  "Assets never leave the user's wallet.": "자산이 사용자 지갑을 떠나지 않습니다.",
  "Key Control Retained": "키 통제권 유지",
  "The private key always stays with the user.": "프라이빗 키는 항상 사용자에게 있습니다.",
  "No Platform Custody": "플랫폼 보관 없음",
  "Funds are never deposited into the operator's wallet.": "운영 주체의 지갑에 예치되지 않습니다.",
  "Verifiable Participation": "검증 가능한 참여 구조",
  "Every step is transparently verifiable on-chain.": "모든 흐름이 온체인에서 투명하게 검증됩니다.",
  "The L-IDO Non-Custodial Onboarding Flow": "L-IDO 비수탁형 온보딩 흐름",
  "Keep Your Wallet": "사용자 지갑 유지",
  "Start with your own wallet and keys, held directly by you.":
    "사용자가 자신의 지갑과 키를 직접 보유한 채 시작합니다.",
  "Interact With the Contract Directly": "스마트 컨트랙트 직접 상호작용",
  "Communicate directly with the smart contract, with no central platform in between.":
    "중앙 플랫폼을 거치지 않고 컨트랙트와 직접 통신합니다.",
  "Onboarding Completes Securely": "안전한 온보딩 완료",
  "Onboarding finishes securely, governed entirely by on-chain rules.":
    "체인 위 규칙에 따라 온보딩이 안전하게 종료됩니다.",

  // Content
  CONTENT: "콘텐츠",
  Content: "콘텐츠",
  "Content Direction": "콘텐츠 제작 방향",
  "Using AI technology to maximise production efficiency while building original IP in many forms.":
    "AI 기술을 활용하여 제작 효율을 극대화하고, 다양한 형태의 오리지널 IP를 만들어갑니다",
  "Content Lineup": "콘텐츠 라인업",
  "Music IP": "Music IP",
  "We will produce original music IP across a range of genres through singles, full albums and collaboration with songwriters worldwide.":
    "싱글, 정규앨범, 글로벌 작곡가 협업을 통해 다양한 장르의 오리지널 음악 IP를 제작해 나갈 예정입니다.",
  "Short Drama": "Short Drama",
  "We plan and produce ultra-compressed, immersive short-drama series in one- to two-minute episodes, using an AI hybrid production method.":
    "AI 하이브리드 제작 방식을 도입하여 1~2분 에피소드의 초압축 몰입형 숏드라마 시리즈를 기획·제작합니다.",
  "We diversify content through an OSMU strategy that expands a single original IP into webtoons, web novels, short drama, film and more.":
    "하나의 원천 IP를 웹툰, 웹소설, 숏드라마, 영화 등으로 확장하는 OSMU 전략을 통해 콘텐츠를 다각화합니다.",
  "Developing Technology to Protect Original Creators": "원저작자 보호 기술 개발 중",
  "When AI-based content production draws on reference material, we are developing our own technology to protect the rights of the original creator — recognising their contribution and building a fair compensation system.":
    "AI 기반 콘텐츠 제작 시 레퍼런스를 토대로 생성할 경우, 원저작자의 권리를 보호하는 기술을 자체 개발하고 있습니다. 창작자의 기여를 인정하고 정당한 보상 체계를 구축하는 것을 목표로 합니다.",
  "EFFICIENCY": "효율성",
  "Why This Is More Efficient Than Traditional Entertainment": "기존 엔터보다 왜 더 효율적인가",
  "Where the traditional entertainment model depends heavily on a single artist, a single work and a single hit, our Transmedia IP strategy expands one IP across multiple layers — not recycling content, but amplifying its value.":
    "기존 엔터테인먼트 모델이 하나의 아티스트, 하나의 작품, 하나의 흥행 성과에 크게 의존하는 구조였다면, 우리의 Transmedia IP 전략은 하나의 IP를 다층적으로 확장하여 콘텐츠의 재활용이 아니라 가치 증폭을 만들어내는 구조입니다.",
  "The Traditional Entertainment Model": "기존 엔터테인먼트 모델",
  "A structure that depends heavily on a single artist, a single work and a single hit.":
    "하나의 아티스트, 하나의 작품, 하나의 흥행 성과에 크게 의존하는 구조입니다.",
  "Transmedia IP Strategy": "Transmedia IP 전략",
  "A structure that expands one IP across multiple layers, amplifying value rather than recycling content.":
    "하나의 IP를 다층적으로 확장하여 콘텐츠의 재활용이 아니라 가치 증폭을 만들어내는 구조입니다.",
  "Multi-format expansion — an IP, once created, expands into many formats.":
    "다중 포맷 확장 — 한 번 만든 IP가 여러 포맷으로 확장됩니다.",
  "Repeat consumption — it is consumed repeatedly across multiple markets and platforms.":
    "반복적 소비 — 여러 시장과 플랫폼에서 반복적으로 소비됩니다.",
  "Longer lifecycle, wider reach — securing a longer lifecycle and broader touchpoints with fans.":
    "긴 생명주기와 넓은 팬 접점 — 더 긴 생명주기와 더 넓은 팬 접점을 확보하게 됩니다.",
  "REVENUE STRUCTURE": "수익 구조",
  "Multiple Revenue Layers From a Single IP": "하나의 IP로 다층 수익 구조",
  "In the traditional model, if a single work fails commercially the entire recovery structure tends to break down. The OSMU strategy instead expands one original IP into multiple formats, generating revenue from several touchpoints rather than depending on a single success. A single IP creates several formats, several markets and several revenue streams at once.":
    "기존 방식은 한 작품이 흥행에 실패하면 회수 구조가 단절되기 쉽습니다. 반면 OSMU 전략은 하나의 원천 IP를 다양한 포맷으로 확장함으로써, 단일 성공 여부에 의존하지 않고 여러 접점에서 매출을 발생시킬 수 있습니다. 하나의 IP가 여러 포맷, 여러 시장, 여러 수익원을 동시에 만들어내는 구조입니다.",

  // Careers
  CAREERS: "채용",
  Careers: "채용 공고",
  "We're looking for people to build the future of entertainment together with Block Label.":
    "Block Label과 함께 미래의 엔터테인먼트를 만들어갈 인재를 찾고 있습니다.",
  "Ongoing Recruitment": "상시 채용",
  "Open Positions": "모집 중인 포지션",
  "MORIPE · Nationwide Block Label Dealers": "MORIPE · 전국 BLOCK LABEL 대리점",
  "AI Instructor": "AI 강사 모집",
  "Full-time, contract (one year, convertible to permanent based on performance), or freelance (hourly / per project). Ongoing recruitment.":
    "정규직 · 계약직(1년, 성과에 따라 정규직 전환) · 프리랜서(시간제 / 프로젝트별). 상시 채용.",
  "Full-time": "정규직",
  "Dancers & Choreographers": "댄서 및 안무가 모집",
  "Ongoing recruitment.": "상시 채용.",
  "AI Video Content Creator": "AI 영상 콘텐츠 제작자 모집",
  Actors: "배우 모집",
  "How to Apply": "지원 방법",
  "Rolling recruitment — applications are accepted on an ongoing basis and may close early once filled. Enquiries: 1577-3204":
    "상시 채용 (수시 서류 접수 · 마감 시 조기 종료). 문의: 1577-3204",

  // Dealer Programme
  "Dealer Programme": "대리점 프로그램",
  "DEALER NETWORK": "대리점 네트워크",
  "Find a Dealer Near You": "나와 가까운 대리점",
  "Nationwide MORIPE AI education dealers offer online and offline training, plus tablet purchase consultations.":
    "전국 모리페 AI 교육 대리점에서 온·오프라인 교육과 태블릿 구매 상담을 받으실 수 있습니다.",
  "Dealer Directory": "대리점 안내",
  "Coming soon. We are currently confirming and organising dealer locations nationwide, and will share dealer locations and directory information here once that's complete.":
    "준비중입니다. 현재 전국 대리점주 소재지를 확인·정리하고 있습니다. 정리가 완료되는 대로 대리점 위치와 안내 정보를 이곳에서 공유해 드리겠습니다.",
  "Consultations Available Now": "지금 신청 가능한 상담",
  "Tablet purchase consultation": "태블릿 구매 상담 신청",
  "Dealer contract consultation": "대리점 계약 상담 신청",
  "Phone enquiries: 1577-3204": "전화 문의: 1577-3204",

  // BDL Token
  "BDL Token": "BDL 토큰",
  "NFT Certificate · BDL Token": "NFT 증서 · BDL 토큰",
  "The NFT certificate is the document that proves a dealer's rights, recorded transparently on BNB Smart Chain.":
    "NFT 증서는 대리점주의 권리를 증명하는 문서이며, BNB Smart Chain에 투명하게 기록됩니다.",
  "NFT Certificate": "NFT 증서",
  "It is held in the dealer's own wallet. Ownership and control of the asset always remain with the dealer.":
    "대리점주 본인 지갑에 보관됩니다. 자산의 소유권과 통제권은 항상 대리점주에게 있습니다.",
  "BDL Token Economy": "BDL 토큰 이코노미",
  "BDL is the integrated utility token of the Block Label ecosystem. NFT certificate holders gain BDL mining rights.":
    "BDL은 Block Label 생태계의 통합 유틸리티 토큰입니다. NFT 증서 보유자는 BDL 채굴 권한을 갖게 됩니다.",
  "Important Notice": "유의 사항",
  "BDL is a utility and governance token. It does not promise investment returns and does not represent securities rights.":
    "BDL은 유틸리티·거버넌스 토큰으로, 투자·수익을 약속하거나 증권적 권리를 표상하지 않습니다.",
  "Corporate Structure": "법인 구조",
  "Block DAO Foundation (an overseas non-profit foundation) operates independently of Block Label Co., Ltd. (the domestic corporation). Their capital structures, management and decision-making are fully separate.":
    "Block DAO Foundation(해외 비영리 재단)은 ㈜블록 레이블(국내 법인)과 독립적으로 운영됩니다. 자본 구조, 경영, 의사결정이 분리되어 있습니다.",

  // News
  NEWS: "소식",
  News: "회사 소식",
  "Check out Block Label's latest announcements and project updates.":
    "Block Label의 최신 공지사항과 프로젝트 업데이트를 확인해보세요.",
  "Press Release Board": "보도 자료 게시판",
  "MoneyToday · 2026.07.30": "머니투데이 · 2026.07.30",
  "Block Label Signs B2B Deal to Bring Samsung Knox-Based 'MORIPE' to the Galaxy Tab":
    "블록레이블, 갤럭시탭에 삼성 Knox 기반 'MORIPE' 탑재 B2B 공급 계약",
  "Reported by MoneyToday.": "머니투데이 보도.",
  "MoneyToday · 2026.04.08": "머니투데이 · 2026.04.08",
  "Block Label Launches the 'Della' Ballad Project — Produced by Pink Apple and Lee Tae-hyun":
    "블록 레이블, '델라' 발라드 프로젝트 론칭…Pink Apple·이태현 프로듀싱",
  "Project News Board": "프로젝트 소식 게시판",
  "New project updates are coming soon.": "곧 새로운 프로젝트 소식을 전해드릴 예정입니다.",

  // Notices
  NOTICES: "공지",
  Notices: "공지사항",
  "Official notices from Block Label.": "Block Label의 공식 공지사항입니다.",
  "No Notices Yet": "등록된 공지사항이 없습니다",
  "Notices will appear here once published. Enquiries: 1577-3204 · support@block-label.com":
    "공지사항이 등록되면 이곳에 표시됩니다. 문의: 1577-3204 · support@block-label.com",

  // Contact
  CONTACT: "문의",
  "Enquiries are routed to the right channel by type, and each department reviews and responds promptly.":
    "문의 유형에 따라 담당 채널이 구분되어 있으며, 접수된 문의는 해당 부서에서 신속히 검토 후 회신드리고 있습니다.",
  "Contact Channels": "문의 채널",
  "Business & Partnerships": "사업 · 제휴",
  "Partnerships, investment and media enquiries.": "사업 제휴, 투자, 미디어 문의.",
  "Customer Support": "고객 지원",
  "Customer service, general enquiries and operations.": "고객 서비스, 일반 문의, 운영 관련.",
  "A&R": "A&R",
  "Artist recruitment and production collaboration enquiries.": "아티스트 모집, 제작 협업 문의.",
  "By Phone": "전화 문의",
  "1577-3204 (main line)": "1577-3204 (대표 번호)",

  // Dealer Application (form)
  "Dealer Application": "대리점 신청",
  "DEALER PARTNERSHIP": "대리점 파트너십",
  "Dealer Partnership Application": "대리점 계약 상담 신청",
  "We're recruiting regional dealers. A dedicated manager will walk you through the revenue structure — sales margin, monthly fee and referral rewards — and the contract process, one on one.":
    "지역 대리점 모집 · 판매 마진 · 월정액 · 추천 보상으로 이어지는 수익 구조와 계약 절차를 1:1로 안내해 드립니다.",
  "PROCESS": "진행 절차",
  "Four Steps to a Contract": "계약까지 4단계",
  "Submit Your Enquiry": "상담 신청",
  "Fill out the form below.": "아래 양식을 작성해 주세요.",
  "One-on-One Guidance": "1:1 안내",
  "A manager will walk you through the revenue structure.": "담당자가 수익 구조를 안내해 드립니다.",
  "Agree Terms": "조건 협의",
  "Discuss your preferred region and contract terms.": "희망 지역과 계약 조건을 협의합니다.",
  "Sign the Contract": "계약 체결",
  "The NFT certificate is issued once the contract is signed.": "계약 체결 후 NFT 증서가 발급됩니다.",
  Name: "이름",
  "Contact number": "연락처",
  "Email (optional)": "이메일 (선택)",
  "Preferred region (city)": "희망 지역 (시)",
  "Preferred region (district)": "희망 지역 (구/군)",
  "Business type": "사업자 형태",
  "Please select": "선택해 주세요",
  Individual: "개인",
  "Sole proprietor": "개인사업자",
  Corporation: "법인",
  "Expected investment": "예상 투자 규모",
  "Up to ₩10M": "~1천만원",
  "₩10M–₩30M": "1천~3천만원",
  "₩30M–₩50M": "3천~5천만원",
  "₩50M+": "5천만원~",
  "Referral code (optional)": "추천 코드 (선택)",
  "Message (optional)": "문의 내용 (선택)",
  "[Required] I agree to the collection and use of my personal information.":
    "[필수] 개인정보 수집 · 이용에 동의합니다.",
  "[Required] I am at least 14 years old (16+ if resident in the EU/EEA).":
    "[필수] 본인은 만 14세 이상(EU/EEA 거주자는 만 16세 이상)입니다.",
  "[Optional] I agree to receive marketing information such as business briefings and promotions.":
    "[선택] 사업 설명회 · 프로모션 등 마케팅 정보 수신에 동의합니다.",
  "Submit Dealer Enquiry": "대리점 상담 신청하기",

  // Tablet Consultation (form)
  "Tablet Consultation": "태블릿 상담",
  MORIPE: "모리페",
  "Get the Latest Samsung Galaxy Tab 11+, Learn AI, and Try Monetizing It":
    "최신 SAMSUNG 갤럭시 탭 11+ 태블릿 PC도 받고, AI도 배우고, 수익화도 도전하자",
  "Buy the tablet and get three years of online and offline AI education — at least ₩1.5M worth of training, plus content production, monetization, contests and job placement support.":
    "태블릿 구매 시 온·오프라인 AI 교육을 3년간 제공합니다. 최소 150만원 상당의 교육 혜택과 콘텐츠 제작 · 수익화 · 공모전 · 채용 연계까지.",
  "What's Included": "혜택 안내",
  "TABLET FREE CHALLENGE": "태블릿 프리 챌린지",
  "Get Your Tablet for Free": "태블릿이 무료가 됩니다",
  "Verify six months of earnings through MORIPE while taking the three-year AI course, and your tablet PC becomes free!":
    "3년간 AI 수업을 수강하는 동안 모리페에서 6개월 수익 인증하면 태블릿 PC가 무료가 됩니다!",
  "800-Unit Sales Milestone": "800대 판매 마일스톤",
  "Expanding Training Infrastructure": "교육 인프라 확장",
  "Training infrastructure expands every time 800 tablets are sold.":
    "태블릿 800대가 판매될 때마다 교육 인프라가 함께 확장됩니다.",
  "MORIPE Integrated Growth Plan": "MORIPE 통합 성장 플랜",
  "From Device to Career": "디바이스부터 커리어까지",
  "Four stages completed with a single purchase.": "한 번의 구매로 완성되는 4단계.",
  Country: "국가",
  "Mobile number": "연락처 (휴대전화)",
  "Region (city / district)": "거주 지역 (시 · 구)",
  "Area of interest": "관심 분야",
  "[Required] I am at least 14 years old.": "[필수] 본인은 만 14세 이상입니다.",
  "[Optional] I agree to receive marketing and promotional information.":
    "[선택] 마케팅 · 프로모션 정보 수신에 동의합니다.",
  "Request a Consultation": "상담 신청하기",

  /* ── Contact page ── */
  Contact: "문의하기",

  /* ── Application form (shared) ── */
  Application: "지원",
  "Partner Consultation Application": "파트너 상담 신청",
  "Please complete the required fields": "필수 항목을 입력해 주세요",
  "Please accept the required consents": "필수 동의 항목에 체크해 주세요",
  "Personal Information Consent": "개인정보 수집 · 이용 동의",
  "Your enquiry opens in your email app, addressed to":
    "문의 내용은 이메일 앱에서 열리며, 다음 주소로 전송됩니다",

  /* ── Misc ── */
  APY: "APY",
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? (localStorage.getItem("lang") as Lang)
        : null;
    if (stored) setLang(stored);
  }, []);
  const update = (l: Lang) => {
    setLang(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };
  const t = (s: string) =>
    applyBrandTokens(lang === "kr" ? (kr[s] ?? s) : s);
  return (
    <I18nContext.Provider value={{ lang, setLang: update, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
