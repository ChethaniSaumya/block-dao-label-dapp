import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { ExternalLink } from "lucide-react";

const WEBKEY_INVITE_LINK =
  "https://app.blocklabel.vip/#/myinvite?code=0xF148fA0C97696564395be20f34E2e755607e07dD";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img
              src={BRAND.logo}
              alt={BRAND.foundation}
              className="h-8 w-8 object-contain"
            />
            <span className="font-display font-semibold">{BRAND.shortName}</span>
            <span className="text-xs text-muted-foreground ml-2">
              © {BRAND.copyrightYear} {BRAND.foundation}
            </span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground">
              {t("About")}
            </Link>
            <a href="#" className="hover:text-foreground">
              {t("Terms")}
            </a>
            <a href="#" className="hover:text-foreground">
              {t("Privacy Policy")}
            </a>
            <Link to="/language" className="hover:text-foreground">
              {t("Language")}
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {t(
              "{{BRAND}} is built on the BNB Chain.",
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
