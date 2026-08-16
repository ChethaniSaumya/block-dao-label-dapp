import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { Section, Card } from "@/components/ui-bits";
import { useI18n } from "@/lib/i18n";
import type { JobPosting } from "@/lib/site-content";

function List({ title, items }: { title: string; items?: string[] }) {
  const { t } = useI18n();
  if (!items?.length) return null;
  return (
    <div className="mt-8 first:mt-0">
      <h2 className="font-semibold text-base">{t(title)}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((i) => (
          <li key={i} className="flex gap-3 text-sm text-muted-foreground">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-gold"
            />
            <span>{t(i)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function JobDetailPage({ job }: { job: JobPosting }) {
  const { t } = useI18n();
  return (
    <Section className="py-14 max-w-3xl">
      <Link
        to="/careers"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold-lift transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t("Back to List")}
      </Link>

      <Card className="mt-4" ornament>
        <h1 className="font-engraved text-2xl md:text-3xl font-medium">
          {t(job.title)}
        </h1>

        <div className="mt-5 grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">
              {t("Employment Type")}
            </div>
            <div className="mt-1 font-medium">{t(job.employmentType)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              {t("Recruiting Period")}
            </div>
            <div className="mt-1 font-medium">{t(job.recruitingPeriod)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              {t("Compensation")}
            </div>
            <div className="mt-1 font-medium">{t(job.compensation)}</div>
          </div>
        </div>

        <hr className="rule-gold mt-6 mb-2" />

        <List title="Key Responsibilities" items={job.responsibilities} />
        <List title="Qualifications" items={job.qualifications} />
        <List title="Preferred" items={job.preferred} />
        <List title="Working Conditions" items={job.workingConditions} />
        <List title="Benefits" items={job.benefits} />

        <div className="mt-8">
          <h2 className="font-semibold text-base">{t("How to Apply")}</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {t(job.howToApply)}
          </p>
          <a
            href={`mailto:${job.applyEmail}`}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-gradient-gold text-gold-foreground font-semibold text-sm shadow-gold hover:opacity-90 transition"
          >
            <Mail className="w-4 h-4" />
            {job.applyEmail}
          </a>
        </div>
      </Card>
    </Section>
  );
}
