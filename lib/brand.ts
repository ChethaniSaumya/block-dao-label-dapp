/**
 * ───────────────────────────────────────────────────────────────────────────
 *  BRAND — single source of truth for all brand identity.
 * ───────────────────────────────────────────────────────────────────────────
 *
 *  To rebrand the entire DApp (name, symbol, copy, logo letter, links), edit
 *  the values in this file ONLY. Every user-facing brand string in the app is
 *  derived from here, via two mechanisms:
 *
 *   1. i18n token substitution — inside any string passed to `t()`, the tokens
 *      `{{BRAND}}` and `{{SYMBOL}}` are replaced with `BRAND.name` /
 *      `BRAND.symbol` at render time (see src/lib/i18n.tsx). This keeps the
 *      translation keys brand-agnostic.
 *
 *   2. Direct reference — non-translatable contexts (route <head> meta titles,
 *      logo marks, raw labels/suffixes) import `BRAND` and read fields directly.
 *
 *  NOTE: the on-chain BDL token name/symbol (BlockLabelToken, "Block DAO Label"
 *  / "BDL", fixed 10B supply) must match these display values at deployment.
 */
export const BRAND = {
  /** Full token / project name (per whitepaper). Used in copy & meta titles. */
  name: "Block DAO Foundation",
  /** Ticker / symbol shown next to amounts. */
  symbol: "BDF",
  /** Short name for tight spaces (header, footer). Matches the logo wordmark. */
  shortName: "Block DAO",
  /** Legal foundation name. */
  foundation: "Block DAO Foundation",
  /** Official logo (served from /public). Used in navbar, footer, share cards. */
  logo: "/block-label-logo-new.png",
  /** Single-letter mark, fallback when the logo image is unavailable. */
  initial: "B",
  /** Copyright year shown in the footer. */
  copyrightYear: "2026",
  /** One-line tagline used in hero / share cards. */
  tagline: "Consensus Creates New Value",
  /** Meta description (SEO / Open Graph). Tokens are resolved on use. */
  description:
    "{{BRAND}} ({{SYMBOL}}) establishes a new operating model for a decentralized ecosystem — moving past minority operator monopolies through decentralized project review and DASA standards.",
} as const;

/** Resolve `{{BRAND}}` / `{{SYMBOL}}` tokens in any string. */
export function applyBrandTokens(s: string): string {
  return s
    .replace(/\{\{BRAND\}\}/g, BRAND.name)
    .replace(/\{\{SYMBOL\}\}/g, BRAND.symbol);
}
