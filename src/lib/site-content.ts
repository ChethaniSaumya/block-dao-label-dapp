/**
 * Corporate content mirrored from block-label.com so the DApp carries the same
 * company information rather than sending users to a separate property.
 *
 * Source: client-supplied screenshots of the live site's English pages
 * (F:\Fiverr V2\minell7182_2026\Pages, August 2026) plus About.pdf. Text is
 * transcribed verbatim from those assets — this IS the site's own English
 * copy, not a translation of the Korean version. Where a screenshot showed
 * content at a resolution too low to transcribe with confidence (a few small
 * badge callouts on the Tablet Consultation page), the copy here is a
 * conservative paraphrase rather than a guess at exact figures — flagged
 * inline with a comment.
 *
 * `ContentPage` renders every section type; `JobDetailPage` and
 * `ArticleDetailPage` render the Careers/News/Notices detail pages. The route
 * file for each page is a thin wrapper around this data.
 */

export interface ContentItem {
  title: string;
  body: string;
  /** Small label above the title — a category, tag list, date, or source. */
  meta?: string;
  /** If set, the card links to this in-app route. */
  href?: string;
}

export interface ContentSection {
  eyebrow?: string;
  title?: string;
  body?: string;
  /** Rendered as a grid of engraved plates. */
  items?: ContentItem[];
  /** Rendered as a gold-marked list. */
  bullets?: string[];
  /** Rendered as gilded stat tiles. */
  stats?: { value: string; label: string }[];
  /** Rendered as a numbered sequence. */
  steps?: ContentItem[];
  /** Rendered as a click-to-expand accordion. */
  faq?: { question: string; answer: string }[];
}

export interface SitePage {
  slug: string;
  /** Label used in the footer and page masthead. */
  nav: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: ContentSection[];
}

/** An application form mirrored from the corporate site. */
export interface FormField {
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}
export interface FormPage extends SitePage {
  fields: FormField[];
  consents: { label: string; required: boolean }[];
  /** Longer legal text shown above the consent checkboxes. */
  legalNotice?: { title: string; body: string }[];
  /** Shown under the consent checkboxes, above submit. */
  consentFootnote?: string;
  submitLabel: string;
  /** Enquiries are composed as email — the DApp has no form backend. */
  mailto: string;
}

/* ─────────────────────────── Company ─────────────────────────── */

export const BUSINESS: SitePage = {
  slug: "business",
  nav: "Business Areas",
  eyebrow: "BUSINESS",
  title: "Business Areas",
  intro: "A comprehensive content IP company spanning music, video, and publishing.",
  sections: [
    {
      items: [
        {
          title: "Music Production",
          body: "Overseeing the entire process of music IP from discovering new artists to album production and global distribution. Supporting artist growth with professional management systems.",
          meta: "Single/Full Album Production · Global Songwriter Collaboration · Live Performance Planning",
        },
        {
          title: "Short-form Drama",
          body: "Mass-producing high-quality short dramas with 90% cost reduction by adopting AI production technology. Presenting ultra-compressed immersive content of 1-2 minute episodes.",
          meta: "240+ Short Drama Lineup · AI Hybrid Production · OTT Platform Distribution",
        },
        {
          title: "Transmedia IP",
          body: "Executing OSMU (One Source Multi Use) strategy expanding a single original IP into webtoons, web novels, short dramas, movies, and more.",
          meta: "30 Webtoons / 4 Web Novels · Original-based Video Adaptation · Global IP Licensing",
        },
        {
          title: "AI Video Showcase",
          body: "Participating in global film festivals and technology showcases with high-quality videos produced using cutting-edge AI technology.",
          meta: "Global Film Festival Entry · AI Technology Showcase · Brand Awareness Expansion",
        },
      ],
    },
    {
      eyebrow: "CONTESTS & CHALLENGES",
      title: "Next-Gen Contest Model",
      body: "Block Label presents a new content production model where demand-side brands and small business owners connect directly with supply-side creators. Each contest gathers multiple entries from many creators, and a single IP discovered there can expand step by step into advertising, AI video, short drama, OST, web novels, and webtoons. All participants receive entry fees, and outstanding works earn additional prizes.",
      items: [
        {
          title: "Guaranteed Entry Fee",
          body: "A fair reward structure where all participants receive an entry fee for entry, regardless of selection.",
        },
        {
          title: "IP Expansion",
          body: "An OSMU structure where a single IP expands into ads, video, drama, music, and literature.",
        },
        {
          title: "Demand-Supply Direct",
          body: "Brands and creators meet directly on the platform, reducing intermediary costs and improving efficiency.",
        },
        {
          title: "Many Participants",
          body: "Many creators join one contest, and multiple entries can be compared and selected.",
        },
      ],
    },
    {
      title: "Contest Formats",
      items: [
        {
          title: "Ad Contest",
          body: "When a small business registers an ad budget, creators produce and submit SNS short-form ad videos. 1st and 2nd place winners receive additional prizes.",
          meta: "SNS Shorts · Brand Promotion · Prizes",
        },
        {
          title: "AI Video Contest",
          body: "A contest to produce high-quality video content using AI production technology. Offers opportunities to connect with film festivals and tech showcases.",
          meta: "AI Generation · Video Production · Showcase",
        },
        {
          title: "Short-form Drama Contest",
          body: "A contest for ultra-compressed 1-2 minute short drama scripts and videos. Outstanding works are connected to OTT platform distribution and official production.",
          meta: "Short Drama · OTT · IP Expansion",
        },
        {
          title: "OST & Music IP Contest",
          body: "A contest for OSTs and music IP that match characters and worldviews. Discovers works that can expand from tracks into story IP.",
          meta: "OST · Music IP · Character Song",
        },
        {
          title: "Web Novel & Webtoon Contest",
          body: "A contest for creative works that can expand a single original IP into web novels and webtoons. Selects work that becomes the starting point for OSMU strategy.",
          meta: "Web Novel · Webtoon · Original IP",
        },
      ],
    },
    {
      title: "Example: Ad Contest Operating Structure",
      body: "When a small business registers a 500,000 KRW ad budget, 20 participants each receive 10,000 KRW entry fees and produce short ad videos. Additional prizes of 200,000 KRW for 1st place and 100,000 KRW for 2nd place are awarded.",
      stats: [
        { value: "₩500,000", label: "Total Ad Budget" },
        { value: "₩10,000 × 20", label: "Entry Fee" },
        { value: "₩200,000 / ₩100,000", label: "1st / 2nd Place Prize" },
      ],
    },
    {
      eyebrow: "LICENSE HOLDERS",
      title: "The Role of License Holders",
      body: "License holders are the main actors of IP wholesale distribution, contributing to the ecosystem while sharing in its outcomes and governance.",
    },
    {
      eyebrow: "DECENTRALIZED IP SUPPLY & PERMISSIONING",
      title: "How IP Enters the Block Label Ecosystem",
      body: "License holders supply diverse IP — music, characters, brands, and content — into the ecosystem and grant purpose-specific permissions, creating the starting point for distribution and utilization.",
      steps: [
        { title: "IP Registration", body: "Register owned IP into the ecosystem." },
        { title: "Permission Setup", body: "Define purpose and scope of use." },
        { title: "Distributed Connection", body: "Channel-by-channel distribution and expansion." },
        { title: "Usage Management", body: "Transparent tracking of history and flow." },
      ],
    },
    {
      eyebrow: "WHY DISTRIBUTED DISTRIBUTION",
      title: "Beyond Monopolistic Distribution",
      body: "Unlike traditional centralized distribution, Block Label pursues an ecosystem where both production and distribution are decentralized. IP is not locked into a single channel but expanded simultaneously across platforms, partners, shops, and communities.",
      steps: [
        { title: "Legacy Distribution", body: "Rights and revenue concentrated in a few." },
        { title: "Block Label Model", body: "Production and distribution decentralized together." },
        { title: "Simultaneous Expansion", body: "Growth across multiple channels at once." },
        { title: "Shared Outcomes", body: "Participants and outcomes connected together." },
      ],
    },
    {
      eyebrow: "WHY BLOCKCHAIN-BASED PRODUCTION & DISTRIBUTION RECORDS",
      title: "On-chain History That Reduces Side Effects",
      body: "By linking production, distribution, and provenance on-chain, Block Label reduces illegal production and unauthorized sales of IP, mitigates the side effects of gray-market distribution, and ensures rewards flow back to actual creators.",
      steps: [
        { title: "Production Record", body: "Log IP creation and manufacturing on-chain." },
        { title: "Distribution Tracking", body: "Transparently verify distribution routes and sales flow." },
        { title: "Illicit Activity Prevention", body: "Curb unauthorized sales, scalping, and gray-market distribution." },
        { title: "Contributor Rewards", body: "Return value to real creators and participants." },
      ],
    },
    {
      steps: [
        {
          title: "Subject of IP Wholesale Distribution",
          body: "License holders act as the principal of IP wholesale distribution and serve as core partners of the content ecosystem.",
        },
        {
          title: "Channel & Network-based Distribution",
          body: "Each holder distributes IP products effectively through their own independent channels and global networks.",
        },
        {
          title: "Direct Sales Margin",
          body: "License holders generate direct sales margins from the revenue produced by their distribution activities.",
        },
        {
          title: "Contributor Pool Reflow",
          body: "5% of project outcomes flows back to the active contributor pool, ensuring sustainable participant participation.",
          meta: "5%",
        },
        {
          title: "DAO Governance Participation",
          body: "Holders participate directly in decision-making and exercise authority within a transparent DAO governance structure.",
        },
      ],
    },
  ],
};

export const TECHNOLOGY: SitePage = {
  slug: "technology",
  nav: "Technology",
  eyebrow: "TECHNOLOGY",
  title: "Tech Innovation",
  intro:
    "Achieving efficiency and transparency in the entertainment industry simultaneously with AI and blockchain.",
  sections: [
    {
      items: [
        {
          title: "AI Production System",
          body: "Introducing AI across the entire production process of video, music, and images, reducing costs by 90% and securing 10x more IPs per budget.",
        },
        {
          title: "Blockchain Copyright Protection",
          body: "Immutably recording creation time and rights with on-chain timestamping, securing global legal protection through dual registration with KOMCA and US Copyright Office.",
        },
        {
          title: "Smart Contract Settlement",
          body: "Revenue is automatically and transparently distributed through smart contracts. Innovating the settlement process from 6-12 months to real-time.",
        },
        {
          title: "AI IP Valuation",
          body: "AI analysis engine analyzes similar genre data and participant metrics to pre-assess the potential market value of IPs before production.",
        },
      ],
    },
    {
      stats: [
        { value: "-90%", label: "AI Production Cost Reduction" },
        { value: "10x", label: "IP Output per Same Budget" },
        { value: "5-10x", label: "ROI vs Traditional Media" },
      ],
    },
  ],
};

export const CONTENT: SitePage = {
  slug: "content",
  nav: "Content",
  eyebrow: "CONTENT",
  title: "Content Production Direction",
  intro: "Maximizing production efficiency with AI technology and creating diverse original IPs.",
  sections: [
    {
      items: [
        {
          title: "Music IP",
          body: "We plan to produce original music IPs across various genres through singles, full albums, and global songwriter collaborations.",
        },
        {
          title: "Short Drama",
          body: "We plan and produce ultra-compressed immersive short drama series with 1-2 minute episodes by introducing AI hybrid production methods.",
        },
        {
          title: "Transmedia IP",
          body: "We diversify content through OSMU strategy, expanding a single original IP into webtoons, web novels, short dramas, movies, and more.",
        },
      ],
    },
    {
      title: "Original Creator Protection Technology in Development",
      body: "We are developing our own technology to protect the rights of original creators when generating AI-based content from references. Our goal is to recognize creators' contributions and build a fair compensation system.",
    },
    {
      eyebrow: "EFFICIENCY",
      title: "Why More Efficient Than Traditional Entertainment",
      body: "While the traditional entertainment model heavily relied on a single artist, a single work, and a single box-office result, our Transmedia IP strategy is a structure that amplifies value — not merely recycling content — by multi-layering a single IP.",
      items: [
        {
          title: "Traditional Entertainment Model",
          body: "Heavily relies on a single artist, a single work, and a single box-office result.",
        },
        {
          title: "Transmedia IP Strategy",
          body: "Multi-layers a single IP to create value amplification, not just content recycling.",
        },
      ],
    },
    {
      items: [
        { title: "Multi-format Expansion", body: "An IP created once expands into multiple formats." },
        { title: "Repeated Consumption", body: "Repeatedly consumed across multiple markets and platforms." },
        { title: "Longer Lifecycle & Broader Reach", body: "Secures a longer lifecycle and broader fan touchpoints." },
      ],
    },
    {
      body: "This is precisely why it is stronger than traditional entertainment.",
    },
    {
      eyebrow: "REVENUE STRUCTURE",
      title: "Multi-Layer Revenue from a Single IP",
      body: "In the traditional model, if one work underperforms, the recovery structure is easily broken. In contrast, the OSMU strategy expands a single source IP into various formats, generating revenue from multiple touchpoints without relying on the success of a single release.",
      items: [
        {
          title: "Traditional Model",
          body: "If one work underperforms, the recovery structure is easily broken.",
        },
        {
          title: "OSMU Strategy",
          body: "Expands a single source IP into various formats, generating revenue from multiple touchpoints without relying on the success of a single release.",
        },
      ],
    },
    {
      body: "This is a structure where one IP simultaneously creates multiple formats, multiple markets, and multiple revenue streams.",
    },
  ],
};

export const CAREERS: SitePage = {
  slug: "careers",
  nav: "Careers",
  eyebrow: "CAREERS",
  title: "Careers",
  intro: "Join Block Label and shape the future of entertainment with us.",
  sections: [
    {
      title: "Job Board",
      items: [
        {
          title: "AI Instructor (MORIPE · Nationwide BLOCK LABEL Dealers)",
          meta: "Full-time / Contract (1 year, convertible to full-time based on performance) / Freelance (hourly · per-class)",
          body: "Open year-round (applications reviewed on a rolling basis, may close early once filled)",
          href: "/careers/ai-instructor",
        },
        {
          title: "Dancers & Choreographers",
          meta: "Full-time",
          body: "Open / Year-round",
          href: "/careers/dancers-choreographers",
        },
        {
          title: "AI Video Content Creator",
          meta: "Full-time",
          body: "Open / Year-round",
          href: "/careers/ai-video-content-creator",
        },
        {
          title: "Actors",
          meta: "Full-time",
          body: "Open / Year-round",
          href: "/careers/actors",
        },
      ],
    },
  ],
};

export interface JobPosting {
  slug: string;
  title: string;
  employmentType: string;
  recruitingPeriod: string;
  compensation: string;
  responsibilities: string[];
  qualifications: string[];
  preferred?: string[];
  workingConditions?: string[];
  benefits?: string[];
  howToApply: string;
  applyEmail: string;
}

export const JOBS: JobPosting[] = [
  {
    slug: "ai-instructor",
    title: "AI Instructor (MORIPE · Nationwide BLOCK LABEL Dealers)",
    employmentType:
      "Full-time / Contract (1 year, convertible to full-time based on performance) / Freelance (hourly · per-class)",
    recruitingPeriod: "Open year-round (applications reviewed on a rolling basis, may close early once filled)",
    compensation:
      "Full-time KRW 36M – 54M / year · Contract KRW 3.0M – 4.2M / month · Freelance KRW 50K – 150K / hour (negotiable based on experience, teaching record, and certifications)",
    responsibilities: [
      "Deliver hands-on AI training based on the MORIPE program (offline · online · hybrid)",
      "Run the free AI education curriculum for nationwide BLOCK LABEL dealers and tablet customers",
      "Design and lead practical classes using generative AI tools (ChatGPT, Claude, Gemini, Midjourney, Runway, Veo, Sora, etc.)",
      "Develop track-specific materials for content creation, monetization, competitions, and hiring pipelines",
      "Manage learner outcomes, provide 1:1 feedback, and support hiring / project connections for top graduates",
      "Prepare performance reports and propose curriculum improvements",
    ],
    qualifications: [
      "Open to all education backgrounds, ages, and genders (must be eligible for overseas travel)",
      "1+ year of teaching or training experience in AI · IT · content creation (freelance and online teaching count)",
      "Proficiency with generative AI tools and prompt engineering",
      "Comfortable with MS Office (PPT · Word · Excel) and collaboration tools (Notion, Slack, etc.)",
      "Strong communication skills and confident classroom presence",
      "Veterans and protected-employment applicants receive preference under applicable Korean law",
    ],
    preferred: [
      "Bachelor's degree or higher in AI, Data, Computer Science, or Educational Technology",
      "AI-related certifications (e.g., SQLD, ADsP, Engineer Information Processing, AWS / Google / MS AI certifications)",
      "Lifelong Educator, Vocational Training Instructor, or Technical Instructor credentials",
      "Prior AI teaching experience with corporates, universities, or public institutions",
      "Willing to travel and run sessions at regional dealers",
      "Able to teach in English, Chinese, or Japanese",
      "Runs a personal AI content channel (YouTube, blog, etc.)",
    ],
    workingConditions: [
      "Employment type: choose Full-time / Contract / Freelance (state preference on application)",
      "Working hours: Mon–Fri, 09:00–18:00 (flexible hours and remote work available depending on the teaching schedule)",
      "Location: Seoul HQ and nationwide BLOCK LABEL dealers (travel required based on schedule)",
      "Probation: 3 months for full-time (100% salary paid during probation)",
      "Contract term: 1 year for contract role (renewal or conversion to full-time based on performance and mutual agreement)",
    ],
    benefits: [
      "Full enrollment in Korea's 4 major insurances — National Pension, Health, Employment, Industrial Accident (full-time and contract)",
      "Severance pay (after 1 year), paid annual leave, family-event leave and allowances",
      "Holiday bonuses and quarterly performance incentives (based on teaching outcomes)",
      "Reimbursement of travel, transportation, and lecture-material production costs",
      "Company-issued laptop, tablet, and software licenses",
      "Support for AI books, online courses, and conference fees",
      "Self-development budget and reimbursement of certification exam fees",
      "Opportunities to participate in MORIPE content-creation and monetization projects",
    ],
    howToApply:
      "Please send your resume, teaching CV/portfolio, optional demo lecture video, preferred employment type, and expected compensation to support@block-label.com. Reviews are individual, and the process runs: document screening → demo lecture and practical interview → final offer.",
    applyEmail: "support@block-label.com",
  },
  {
    slug: "dancers-choreographers",
    title: "Dancers & Choreographers",
    employmentType: "Full-time",
    recruitingPeriod: "Open / Year-round",
    compensation: "Per company policy",
    responsibilities: [
      "Choreography creation for stages and music videos",
      "Performance directing and dancer training",
      "Participation in content shoots and live performances",
    ],
    qualifications: [
      "Open to all ages and education backgrounds",
      "Prior dance or choreography experience preferred",
      "Strong teamwork and communication skills",
      "Solid understanding of K-POP and diverse genres",
    ],
    howToApply: "Please send your resume and portfolio (including video links) to support@block-label.com.",
    applyEmail: "support@block-label.com",
  },
  {
    slug: "ai-video-content-creator",
    title: "AI Video Content Creator",
    employmentType: "Full-time",
    recruitingPeriod: "Open / Year-round",
    compensation: "Per company policy",
    responsibilities: [
      "Plan and produce music videos and short-form content powered by generative AI",
      "Design workflows leveraging AI video/image models (Veo, Runway, Sora, Midjourney, etc.)",
      "Prompt design, post-production editing, color and sound direction",
      "Produce artist IP-based original content and collaborate on channel operations",
    ],
    qualifications: [
      "Open to all ages and education backgrounds",
      "Prior video production or motion graphics experience preferred",
      "Proficiency with editing tools such as Premiere Pro, After Effects, DaVinci Resolve",
      "Hands-on experience with generative AI tools and prompt engineering preferred",
      "Strong sense of trends and storytelling capability",
    ],
    howToApply: "Please send your resume and portfolio (including video links) to support@block-label.com.",
    applyEmail: "support@block-label.com",
  },
  {
    slug: "actors",
    title: "Actors",
    employmentType: "Full-time",
    recruitingPeriod: "Open / Year-round",
    compensation: "Per company policy",
    responsibilities: [
      "Performing in children's musicals and stage productions",
      "Short-form content activities on TikTok, YouTube Shorts, and similar platforms",
      "Appearing in dramas, films, commercials, and other video content",
      "Participating in artist IP-based original content production",
    ],
    qualifications: [
      "Open to all ages and education backgrounds",
      "Acting or performance experience preferred (newcomers welcome)",
      "Strong expressiveness, charisma, and camera presence",
      "Available to commit to long-term projects",
    ],
    howToApply: "Please send your resume and portfolio (including video/photo links) to support@block-label.com.",
    applyEmail: "support@block-label.com",
  },
];

/* ────────────────────────── Ecosystem ────────────────────────── */

export const DEALERS: SitePage = {
  slug: "dealers",
  nav: "Dealer Programme",
  eyebrow: "DEALER NETWORK",
  title: "Dealers Near You",
  intro:
    "Get online/offline education and tablet purchase consultation at nationwide Moripe AI education dealers.",
  sections: [
    {
      eyebrow: "Regional Dealer Information",
      title: "Coming Soon",
      body: "We are currently confirming and organizing dealer locations nationwide. The regional dealer list and location guide will be published on this page as soon as they are ready. Until then, leave an inquiry and we will connect you directly with a nearby dealer.",
    },
    {
      bullets: [
        "Request Tablet Consultation",
        "Dealer Contract Consultation",
        "Phone enquiries: 1577-3204",
      ],
    },
  ],
};

/* ── NFT Certificate + BDL Token (merged, as on the live site) ── */

export const TOKEN: SitePage = {
  slug: "token",
  nav: "BDL Token",
  eyebrow: "NFT CERTIFICATE",
  title: "NFT Certificate",
  intro:
    "Block Label's NFT certificate is a rights document issued to dealers. As an on-chain certificate replacing a paper contract, dealer status, settlement rights, and benefit eligibility can be verified at any time.",
  sections: [
    {
      items: [
        {
          title: "Proof of Dealer Rights",
          body: "Rights and status under the dealer agreement are issued as an on-chain certificate (NFT), proving ownership without forgery or tampering.",
        },
        {
          title: "BSC On-chain Record",
          body: "Certificates are recorded on BNB Smart Chain — issuance, transfer, and revocation are all transparently traceable.",
        },
        {
          title: "Non-custodial Storage",
          body: "The certificate is kept directly in the dealer's own wallet. Ownership and control of the asset always remain with the dealer.",
        },
        {
          title: "BDL Mining Rights",
          body: "BDL is not a token used simply by holding the NFT certificate — it is a shared utility token anyone in the ecosystem can use. Only NFT certificate holders are granted the right to mine BDL; this does not guarantee returns or represent an investment right.",
        },
      ],
    },
    {
      body: "Detailed issuance procedures and policies based on the operations manual will be reflected on this page as they become available.",
    },
    {
      eyebrow: "UTILITY TOKEN",
      title: "BDL Token Economy",
      body: "BDL is a shared utility token used within the Block Label ecosystem, usable by anyone regardless of NFT certificate ownership. However, NFT certificate holders are additionally granted the right to mine BDL. It does not promise returns or represent securities rights.",
    },
    {
      title: "BDL Token Overview",
      body: "BDL Token is the core utility & governance token of the Block Label ecosystem.",
    },
    {
      title: "Corporate Structure & Token Classification Notice",
      body: "Block DAO Foundation (the 'Foundation'), the issuer of the BDL token, is a non-profit foundation located overseas, and is a completely separate and independent legal entity from Block Label Co., Ltd. (the Korean corporation). The two organizations operate the IP content business and the token economy business independently, with no debt or liability relationship between them.\n\nAll blockchain-related businesses, including BDL token issuance, token economy operations, and DAO governance, are managed and operated by the Foundation. The BDL token information provided on this website is for reference purposes only regarding the Foundation's project.\n\nThe BDL token is a utility token intended solely for purchasing NFT products and gift certificates (including gift cards) offered by the Foundation. Under no circumstances does this token possess the characteristics of currency, legal tender, electronic money, payment instruments, deposits, bonds, securities, investment contracts, derivatives, or any equivalent financial instruments. Mere holding of the token does not guarantee interest, dividends, principal protection, or investment returns. Therefore, trading or exchanging this token shall not be considered an investment activity, and it is not classified as a security under applicable laws.",
    },
    {
      title: "Frequently Asked Questions (FAQ)",
      body: "Guidance on the legal nature of the BDL token.",
      faq: [
        {
          question: "Q1. Is the BDL token a currency?",
          answer:
            "No. The BDL token is not legal tender, electronic money, or a payment instrument. For example, unlike KRW or USD, it cannot be used to pay for everyday goods or services. It is a limited utility token usable only for purchasing NFT products and gift certificates offered by the Foundation.",
        },
        {
          question: "Q2. Is the BDL token a security?",
          answer:
            "No. The BDL token does not qualify as a security, investment contract, or derivative under capital markets law. For example, unlike a stock, mere holding of the token does not grant equity, voting rights as a shareholder, dividends, interest, principal protection, or any promise of future returns. Holding the token does not guarantee any investment returns.",
        },
        {
          question: "Q3. Then what is the BDL token?",
          answer:
            "The BDL token is a utility token used solely within the Foundation's ecosystem. Examples: (1) purchasing Block Label IP-based NFT products (artist-limited NFTs, content NFTs, etc.), (2) purchasing gift certificates / gift cards issued by the Foundation, and (3) participating in DAO governance voting.",
        },
        {
          question: "Q4. Does buying or selling the token constitute investment activity?",
          answer:
            "No. The trading or exchange of BDL tokens is not regarded as investment activity, and is not classified as a securities transaction under applicable laws. The Foundation cannot control, predict, or guarantee market price fluctuations, and the user bears full responsibility for all transactions.",
        },
        {
          question: "Q5. Are Block Label Co., Ltd. and the Foundation the same company?",
          answer:
            "No. They are completely separate and independent legal entities. Block Label Co., Ltd. is a Korean stock corporation that operates music/video/IP production and content businesses, while Block DAO Foundation is a separate non-profit foundation located overseas that handles token issuance and DAO governance. The two are separated in capital structure, governance, and decision-making.",
        },
      ],
    },
  ],
};

export const NEWS: SitePage = {
  slug: "news",
  nav: "News",
  eyebrow: "NEWS",
  title: "Company News",
  intro: "Discover the latest announcements and project updates from Block Label.",
  sections: [
    {
      title: "Press Releases",
      items: [
        {
          title: "Block Label signs B2B deal to preload 'MORIPE' on Samsung Knox-secured Galaxy Tab",
          meta: "MoneyToday · Jul 30, 2026",
          body: "",
          href: "/news/moripe-samsung-b2b",
        },
        {
          title: "Block Label launches Della's ballad project — produced by PinkApple and Taehyun Lee",
          meta: "MoneyToday · Apr 8, 2026",
          body: "",
          href: "/news/della-ballad-project",
        },
      ],
    },
    {
      title: "Project Updates",
      body: "No project updates yet. Stay tuned for upcoming project news.",
    },
  ],
};

export interface NewsArticle {
  slug: string;
  title: string;
  source: string;
  date: string;
  paragraphs: string[];
}

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    slug: "moripe-samsung-b2b",
    title: "Block Label signs B2B deal to preload 'MORIPE' on Samsung Knox-secured Galaxy Tab",
    source: "MoneyToday",
    date: "Jul 30, 2026",
    paragraphs: [
      "Block Label announced on the 30th that it has signed a B2B agreement with Samsung Electronics Sales Co., Ltd. for the supply of enterprise Galaxy Tab devices, and is adopting Samsung Knox-based enterprise security and device management solutions.",
      "Through the agreement, Block Label will build an enterprise-only security and device management environment combining Galaxy Tab and Samsung Knox, and preload its MORIPE service on those devices. MORIPE is a digital content service delivering webtoons, web novels, web dramas, video and educational content from both users and the platform.",
      "MORIPE's official launch is scheduled for November–December. Ahead of launch, the pre-training phase for nationwide dealers and users will run offline participatory programs covering practical AI, digital content production, lifestyle and general education. Operational experience and user feedback gathered on-site will be reflected in online course production and in further development of the MORIPE service.",
      "Block Label is currently recruiting nationwide dealers responsible for distributing the MORIPE service and its dedicated devices, running offline education, and supporting users by region. Before the official launch, recruited dealers will focus on regional education and user guidance; after launch, they will handle device supply, service guidance and regional hub operations.",
      'CEO Seok Tae-ho said, "This agreement is a foundation for building a dedicated device ecosystem that goes beyond simply supplying tablets, combining a Samsung Knox-based enterprise security environment with the MORIPE content service," adding, "Based on our nationwide dealer network, we will gradually expand so that content, education, creation and the user community are connected within a single service."',
    ],
  },
  {
    slug: "della-ballad-project",
    title: "Block Label launches Della's ballad project — produced by PinkApple and Taehyun Lee",
    source: "MoneyToday",
    date: "Apr 8, 2026",
    paragraphs: [
      "Block Label announced on the 8th the launch of a new ballad project for Indonesian artist Della (Fidella Jasmine), who has over 370,000 YouTube subscribers.",
      "The ballad is built around a vocal-centric structure, foregrounding Della's tone and emotional delivery to convey messages dedicated to loved ones. Rather than heavy ornamentation, the production focuses on the breath of the melody and the clarity of the lyrics, allowing emotion to expand naturally over a restrained sound. Co-producers PinkApple and Taehyun Lee will jointly tune the topline tone, arrangement density, and vocal direction to bring out Della's strengths.",
      "PinkApple has built numerous topline designs and early production structures through demo development collaborations with global songwriters, vocalists, and producers. Recent collaborations include demos with international producers such as Jackie's Boy, Sefi Carmel, Marcus H., Zach Alwin, Doug V, and PRINCE CHAPELLE. Taehyun Lee is actively working in Indonesia.",
      "Block Label is a blockchain-based decentralized music label operated by six co-founders of WebKey DAO, each an expert in their field. It aims to innovate the opaque structure of the existing music industry and build a sustainable ecosystem where artists and fans coexist. Under DAO governance, key decisions on budget execution, new artist discovery, and song selection are made through participant proposals and votes, with smart contract-based automated settlement enabling transparent revenue distribution.",
    ],
  },
];

export const NOTICES: SitePage = {
  slug: "notices",
  nav: "Notices",
  eyebrow: "BLOCK LABEL · OFFICIAL",
  title: "Notices",
  intro: "Check official announcements from Block Label.",
  sections: [
    {
      title: "Notice Board",
      items: [
        {
          title: "Demo Sourcing for New Artists & A&R Team Inquiries",
          meta: "NOTICE #001 · May 12, 2026",
          body: "",
          href: "/notices/demo-sourcing",
        },
        {
          title: "Block Label Official Website Launch",
          meta: "NOTICE #002 · Apr 1, 2026",
          body: "",
          href: "/notices/website-launch",
        },
      ],
    },
  ],
};

export interface NoticePost {
  slug: string;
  number: string;
  title: string;
  date: string;
  paragraphs: string[];
}

export const NOTICE_POSTS: NoticePost[] = [
  {
    slug: "demo-sourcing",
    number: "#001",
    title: "Demo Sourcing for New Artists & A&R Team Inquiries",
    date: "Posted: May 12, 2026",
    paragraphs: [
      "Hello, this is Block Label.",
      "Block Label is not an idol-focused production label. We focus on discovering new artists who stand out across a wide range of genres.",
      "We continuously source demo songs to match with these new artists, and welcome proposals in all forms — composition, lyrics, arrangement, and topline.",
      "All production-related inquiries — song proposals, artist scouting, and composer/producer collaborations — are received through the A&R team channel and replied to individually after internal review.",
      "[A&R · Artists · Production]",
      "· Department: Block Label A&R Team",
      "· Email: anrteam@block-label.com",
      "· Required: Demo files (MP3/WAV), track info (BPM/key/length/genre), writer/producer profile, copyright ownership status",
      "· Response time: Within 2–3 business weeks",
      "All submissions are reviewed under our internal guidelines, and materials are kept strictly confidential regardless of whether they are selected.",
      "We look forward to your participation.",
    ],
  },
  {
    slug: "website-launch",
    number: "#002",
    title: "Block Label Official Website Launch",
    date: "Posted: Apr 1, 2026",
    paragraphs: [
      "Hello, this is Block Label.",
      "We are pleased to announce that the official Block Label website has been newly launched. On this site you can find information about the company, business areas, technology, content, BDL Token, and careers.",
      "Block Label's news and project updates will be promptly shared through the [Company News] and [Notices] boards on this website.",
      "Thank you for your continued interest and support.",
    ],
  },
];

/* ──────────────────────────── Apply ──────────────────────────── */

export const CONTACT: SitePage = {
  slug: "contact",
  nav: "Contact",
  eyebrow: "CONTACT",
  title: "Contact Us",
  intro:
    "Inquiries are routed to dedicated channels by category and reviewed by the responsible team for a timely response.",
  sections: [
    {
      items: [
        {
          meta: "For Customers",
          title: "Tablet Purchase Inquiry",
          body: "Buy a tablet PC and get 3 years of online/offline AI education (worth at least KRW 1.5M), content production, monetization, contests and job connections.",
          href: "/tablet-inquiry",
        },
        {
          meta: "For Business Partners",
          title: "Dealer Contract Consultation",
          body: "We guide you 1:1 through regional dealer recruitment, the revenue structure of sales margin, subscriptions and referral rewards, and the contract process.",
          href: "/dealer-inquiry",
        },
      ],
    },
    {
      items: [
        {
          meta: "Business · Partnerships · Investment",
          title: "business@block-label.com",
          body: "Dedicated channel for partnership proposals, investment opportunities, and media inquiries.",
        },
        {
          meta: "Customer Support · General Inquiries",
          title: "support@block-label.com",
          body: "Dedicated channel for service-related questions, general inquiries, and operational matters.",
        },
        {
          meta: "A&R · Artists · Production",
          title: "anrteam@block-label.com",
          body: "Dedicated channel for song submissions, artist outreach, and composer & producer collaborations.",
        },
      ],
    },
  ],
};

export const DEALER_INQUIRY: FormPage = {
  slug: "dealer-inquiry",
  nav: "Dealer Application",
  eyebrow: "DEALER PARTNERSHIP",
  title: "Dealer Contract Consultation Request",
  intro:
    "We are recruiting partners to join as regional dealers. Our team will personally guide you through the revenue structure and contract process of the tablet · AI education business.",
  sections: [
    {
      eyebrow: "PARTNER BENEFITS",
      title: "Benefits for Dealers",
      items: [
        { title: "Exclusive Regional Operation", body: "Regional dealer authority and sales support." },
        {
          title: "Multi-layer Revenue Structure",
          body: "Sales margin · monthly fees · referral rewards.",
        },
        { title: "HQ Training Support", body: "AI education content and operations manuals provided." },
        { title: "Referral Reward System", body: "5% of directly referred dealer's revenue." },
        { title: "Growth Roadmap", body: "Business expansion linked with flagship store growth." },
      ],
    },
    {
      eyebrow: "DEALER SUPPORT",
      title: "Dealer Support Program",
      body: "Block Label provides practical support for the stable operation and growth of regional dealers.",
      items: [
        {
          title: "Performance Bonus",
          body: "Top-performing dealers receive bonuses from the contribution pool funded by 5% of total qualified sales.",
        },
        {
          title: "Monthly Local Marketing Budget",
          body: "Monthly marketing support for local promotion and customer acquisition.",
        },
        {
          title: "Full-Time Career Path at Direct Stores",
          body: "Outstanding dealers gain opportunities to run direct stores and full-time employment.",
        },
        {
          title: "Business Cards, Flyers, Banners & Business Kit",
          body: "Headquarters produces and supplies branded print materials and business kits.",
        },
      ],
    },
    {
      eyebrow: "PROCESS",
      title: "4 Steps to Contract",
      steps: [
        {
          title: "Consultation Request",
          body: "Submit the form below and a manager will contact you within 1-2 business days.",
        },
        {
          title: "Business Briefing · Due Diligence",
          body: "One-on-one guidance on the revenue structure, regional status, and operations.",
        },
        {
          title: "Contract Signing",
          body: "Complete regional assignment and contract, and receive your dealer code.",
        },
        {
          title: "Launch · Operations Support",
          body: "Start business with training content, devices, and operations manuals.",
        },
      ],
    },
  ],
  fields: [
    { label: "Name", required: true, placeholder: "John Doe" },
    { label: "Phone", required: true, type: "tel", placeholder: "010-0000-0000" },
    { label: "Email (optional)", type: "email", placeholder: "name@example.com" },
    { label: "Preferred Region (City)", placeholder: "Seoul" },
    { label: "Preferred Region (District)", placeholder: "Gangnam-gu" },
    {
      label: "Business Type",
      options: ["Please select", "Individual", "Sole Proprietor", "Corporation"],
    },
    {
      label: "Expected Investment Scale",
      options: ["Please select", "Up to ₩10M", "₩10M–₩30M", "₩30M–₩50M", "₩50M+"],
    },
    { label: "Referral Code (optional)", placeholder: "REFERRER CODE" },
    {
      label: "Message (optional)",
      type: "textarea",
      placeholder: "Feel free to share your operating experience, desired start date, or any questions.",
    },
  ],
  legalNotice: [
    {
      title: "1. Data Controller",
      body: "Block Label Korea Co., Ltd. · Main line 1577-3204 · Privacy inquiries: Contact page",
    },
    {
      title: "2. Items Collected",
      body: "[Required] Name, phone number · [Optional] Email, preferred region, business type, expected investment scale, message · [Automatically collected] Access information (User-Agent, submission time)",
    },
    {
      title: "3. Purpose of Collection · Legal Basis",
      body: "Dealer contract consultation and guidance, provision of business briefing materials, and service improvement, processed on the basis of your consent below.",
    },
  ],
  consents: [
    { label: "[Required] I consent to the collection and use of personal information.", required: true },
    {
      label:
        "[Required] I confirm I am 14 or older (16 or older for EU/EEA residents). Minors require consent from a legal guardian.",
      required: true,
    },
    {
      label: "[Optional] I consent to receive marketing information such as business briefings and promotions.",
      required: false,
    },
  ],
  consentFootnote:
    "If you do not consent to marketing communications, you will only receive guidance regarding your submitted consultation, and cannot be separately contacted about business briefings, policy changes, promotions, or other additional information.",
  submitLabel: "Submit Dealer Consultation Request",
  mailto: "business@block-label.com",
};

export const TABLET_INQUIRY: FormPage = {
  slug: "tablet-inquiry",
  nav: "Tablet Consultation",
  eyebrow: "MORIPE",
  title: "Get the Latest Samsung Galaxy Tab 11+, Learn AI, and Try Monetizing It",
  intro:
    "Purchase a tablet PC and get 3 years of online/offline AI education, content creation, monetization, contests, and job connections.",
  sections: [
    {
      stats: [{ value: "₩1,490,000", label: "Launch Price" }],
    },
    {
      title: "Get Your Tablet PC for Free",
      body: "While taking AI classes for 3 years, certify 6 months of revenue on MORIPE and your tablet PC becomes free!",
    },
    {
      eyebrow: "AI ECONOMIC ACTIVITY SCHOLARSHIP",
      title: "AI Economic Activity Scholarship Program",
      body: "If you certify at least ₩100,000 in monthly content sales for 6 consecutive months, you can receive a ₩1.49M scholarship.",
    },
    {
      title: "Tablet PC + 3-Year AI Education (Worth at least ₩1.5M)",
      body: "Take the courses, create educational content, animation, monetizable shorts, short dramas, web novels, webtoons, films, and books, start distributing, and realize monetization!",
      bullets: [
        "1 Year of Education",
        "Content Creation",
        "Monthly Challenge",
        "Full Participation",
        "Monetization Opportunities",
      ],
    },
    {
      title: "Every Time 800 Tablets Are Sold, the Education Infrastructure Expands Together",
      items: [
        { title: "New Flagship Stores", body: "Flagship stores start opening in student-dense areas." },
        { title: "Expanded Curriculum", body: "3 additional expert online lectures produced." },
        { title: "Dedicated Instructors", body: "1 resident instructor assigned per flagship store." },
        { title: "Local Access", body: "Access to paid and free education from local dealers." },
      ],
    },
    {
      eyebrow: "FROM DEVICE TO CAREER",
      title: "4 Stages Completed With a Single Purchase",
      steps: [
        {
          title: "Receive a Samsung Galaxy Tab 11+",
          body: "Receive the latest tablet, optimized for learning and content creation, as part of your purchase.",
        },
        {
          title: "Online/Offline AI Education (Worth at least ₩1.5M)",
          body: "Learn hands-on content-creation skills directly from AI professionals over 3 years of training.",
        },
        {
          title: "Monetize What You Learn Right Away · Enter Contests",
          body: "Put your new skills to work immediately through contests, brand collaborations, and monthly challenges.",
        },
        {
          title: "Hiring and Project Connections for Top Graduates",
          body: "Outstanding graduates are connected to real project opportunities and hiring pipelines with partner companies.",
        },
      ],
    },
    {
      title: "Want to Partner With Us as a Business?",
      body: "If you're interested in operating as a regional dealer, sales representative, or educational partner, we'll guide you through the details.",
      bullets: ["Apply for Dealer Consultation", "Find a Dealer Near Me"],
    },
  ],
  fields: [
    { label: "Name", required: true },
    { label: "Country", required: true },
    { label: "Phone Number (Mobile)", required: true, type: "tel" },
    { label: "Email (optional)", type: "email" },
    { label: "Region of Residence (City · District)" },
    { label: "Area of Interest" },
    { label: "Referral Code (optional)" },
    { label: "Message (optional)", type: "textarea" },
  ],
  consents: [
    { label: "[Required] I consent to the collection and use of personal information.", required: true },
    { label: "[Required] I am 14 years of age or older.", required: true },
    {
      label: "[Optional] I consent to receive marketing and promotional information.",
      required: false,
    },
  ],
  submitLabel: "Submit Tablet Consultation Request",
  mailto: "support@block-label.com",
};

/** Everything the footer links to, grouped as on the corporate site. */
export const SITE_PAGES: SitePage[] = [BUSINESS, TECHNOLOGY, CONTENT, CAREERS, DEALERS, TOKEN, NEWS, NOTICES, CONTACT];

export const FORM_PAGES: FormPage[] = [DEALER_INQUIRY, TABLET_INQUIRY];
