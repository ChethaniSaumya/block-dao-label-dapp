import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";

/**
 * Every destination below is a page inside this app — the corporate content
 * from block-label.com is mirrored in `src/lib/site-content.ts` and rendered by
 * `ContentPage`, so the footer never sends anyone off to another site.
 */
const COMPANY = [
  { label: "About Block Label", to: "/about" },
  { label: "Business Areas", to: "/business" },
  { label: "Technology", to: "/technology" },
  { label: "Content", to: "/content" },
  { label: "Careers", to: "/careers" },
];

const ECOSYSTEM = [
  { label: "Dealer Programme", to: "/dealers" },
  { label: "BDL Token", to: "/token" },
  { label: "News", to: "/news" },
  { label: "Notices", to: "/notices" },
];

const APPLY = [
  { label: "Dealer Application", to: "/dealer-inquiry" },
  { label: "Tablet Consultation", to: "/tablet-inquiry" },
  { label: "Contact", to: "/contact" },
];

const SOCIAL = [
  { label: "X", href: "https://x.com/BlockLabelDAO" },
  { label: "Telegram", href: "https://t.me/BlockLabelOfficial" },
  { label: "Discord", href: "https://discord.gg/blocklabel" },
  { label: "Medium", href: "https://medium.com/@blocklabel" },
];

/** The four languages the corporate site ships. */
const LANGUAGES = ["한국어", "English", "日本語", "中文"];

function LinkColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; to: string }[];
}) {
  const { t } = useI18n();
  return (
    <div>
      <div className="eyebrow mb-3">{t(title)}</div>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.label}>
            <Link
              to={i.to}
              className="text-sm text-muted-foreground hover:text-gold-lift transition-colors"
            >
              {t(i.label)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer-luxe mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Identity */}
          <div className="lg:col-span-2">
            <img
              src={BRAND.logo}
              alt={BRAND.foundation}
              className="h-16 w-auto object-contain mix-blend-screen"
            />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              {t(
                "A next-generation entertainment and technology company combining AI and blockchain — building a healthy ecosystem where technology and art work together.",
              )}
            </p>
            <div className="mt-5 space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t("Enquiries")}</span>
                <a href="tel:1577-3204" className="text-gold-lift">
                  1577-3204
                </a>
              </div>
              <Link
                to="/contact"
                className="text-muted-foreground hover:text-gold-lift transition-colors"
              >
                {t("All contact channels")}
              </Link>
            </div>
          </div>

          <LinkColumn title="Company" items={COMPANY} />
          <LinkColumn title="Ecosystem" items={ECOSYSTEM} />
          <LinkColumn title="Apply" items={APPLY} />
        </div>

        <hr className="rule-gold my-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link
              to="/about"
              className="text-muted-foreground hover:text-gold-lift transition-colors"
            >
              {t("About")}
            </Link>
            {/*
              Terms / Privacy stay as in-page anchors: block-label.com has no
              standalone policy pages (/terms and /privacy both render 404 — the
              SPA returns HTTP 200 for any path, so check the rendered page, not
              the status). Point them at real URLs once the client confirms
              where the policies live.
            */}
            <a href="#" className="text-muted-foreground hover:text-gold-lift transition-colors">
              {t("Terms")}
            </a>
            <a href="#" className="text-muted-foreground hover:text-gold-lift transition-colors">
              {t("Privacy Policy")}
            </a>
            <Link
              to="/language"
              className="text-muted-foreground hover:text-gold-lift transition-colors"
            >
              {t("Language")}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {SOCIAL.map((sn) => (
              <a
                key={sn.label}
                href={sn.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted-foreground hover:text-gold-lift transition-colors"
              >
                {sn.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {BRAND.copyrightYear} {BRAND.foundation}.{" "}
            {t("{{BRAND}} is built on the BNB Chain.")}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {LANGUAGES.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
