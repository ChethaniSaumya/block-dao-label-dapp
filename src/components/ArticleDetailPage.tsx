import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Section, Card } from "@/components/ui-bits";
import { useI18n } from "@/lib/i18n";

/**
 * Shared detail view for News articles and Notices — both are a title, a
 * meta line (source/date, or notice number/date), and a body of paragraphs.
 */
export function ArticleDetailPage({
  badge,
  title,
  meta,
  paragraphs,
  backTo,
  backLabel,
}: {
  /** Small pill above the title, e.g. "NOTICE #001". Omit for news. */
  badge?: string;
  title: string;
  meta: string;
  paragraphs: string[];
  backTo: string;
  backLabel: string;
}) {
  const { t } = useI18n();
  return (
    <Section className="py-14 max-w-3xl">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold-lift transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t(backLabel)}
      </Link>

      <Card className="mt-4" ornament>
        {badge && (
          <div className="inline-flex px-2.5 py-1 rounded-md bg-secondary text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-gold mb-3">
            {t(badge)}
          </div>
        )}
        <h1 className="font-engraved text-2xl md:text-3xl font-medium">
          {t(title)}
        </h1>
        <div className="mt-2 text-sm text-muted-foreground">{t(meta)}</div>
        <hr className="rule-gold mt-5 mb-6" />
        <div className="space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-muted-foreground leading-relaxed">
              {t(p)}
            </p>
          ))}
        </div>
      </Card>
    </Section>
  );
}
