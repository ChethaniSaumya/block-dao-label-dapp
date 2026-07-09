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
