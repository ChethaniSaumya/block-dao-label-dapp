import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Section, Card, PageHeader, GoldButton } from "@/components/ui-bits";
import { useI18n } from "@/lib/i18n";
import type { ContentSection, SitePage, FormPage } from "@/lib/site-content";

/**
 * Renders a corporate content page in the certificate identity — engraved
 * masthead, gold rules, gilded plates. Every page under Company / Ecosystem /
 * Apply is this component plus an entry in `site-content.ts`.
 */

/** Click-to-expand FAQ row. Closed by default; only one need be open at once
 * but each tracks its own state so several can be open together. */
function FaqRow({ question, answer }: { question: string; answer: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer"
      >
        <span className="font-medium text-sm">{t(question)}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-gold-lift transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {t(answer)}
        </p>
      )}
    </div>
  );
}

function SectionBlock({ section }: { section: ContentSection }) {
  const { t } = useI18n();
  const { eyebrow, title, body, items, bullets, stats, steps, faq } = section;

  return (
    <div className="mt-14 first:mt-0">
      {eyebrow && <div className="eyebrow mb-2">{t(eyebrow)}</div>}
      {title && (
        <h2 className="font-engraved text-2xl font-medium">{t(title)}</h2>
      )}
      {(eyebrow || title) && <hr className="rule-gold mt-4 max-w-xs" />}
      {body && (
        <p className="mt-4 text-muted-foreground max-w-3xl leading-relaxed">
          {t(body)}
        </p>
      )}

      {stats && (
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="p-5 rounded-lg tile text-center">
              <div className="font-engraved text-3xl font-medium foil">
                {t(s.value)}
              </div>
              <div className="mt-1.5 text-xs text-muted-foreground">
                {t(s.label)}
              </div>
            </div>
          ))}
        </div>
      )}

      {items && (
        <div className="mt-6 grid md:grid-cols-2 gap-5">
          {items.map((i) => {
            const content = (
              <>
                {i.meta && (
                  <div className="text-[0.68rem] tracking-[0.16em] uppercase text-gold mb-2">
                    {t(i.meta)}
                  </div>
                )}
                <h3 className="font-semibold text-base flex items-center gap-1.5">
                  {t(i.title)}
                  {i.href && (
                    <ArrowRight className="w-3.5 h-3.5 text-gold-lift" />
                  )}
                </h3>
                {i.body && (
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {t(i.body)}
                  </p>
                )}
              </>
            );
            return i.href ? (
              <Link key={i.title} to={i.href} className="block">
                <Card className="h-full hover:border-gold transition-colors">
                  {content}
                </Card>
              </Link>
            ) : (
              <Card key={i.title}>{content}</Card>
            );
          })}
        </div>
      )}

      {bullets && (
        <ul className="mt-6 space-y-3 max-w-3xl">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3 text-sm text-muted-foreground">
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-gold"
              />
              <span>{t(b)}</span>
            </li>
          ))}
        </ul>
      )}

      {steps && (
        <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, n) => (
            <li key={s.title} className="relative p-5 rounded-lg tile">
              <div className="font-engraved text-2xl foil">{n + 1}</div>
              <h3 className="mt-2 font-semibold text-sm">{t(s.title)}</h3>
              {s.body && (
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {t(s.body)}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}

      {faq && (
        <div className="mt-6 rounded-lg tile px-5 max-w-3xl">
          {faq.map((f) => (
            <FaqRow key={f.question} question={f.question} answer={f.answer} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ContentPage({ page }: { page: SitePage }) {
  const { t } = useI18n();
  return (
    <Section className="py-14">
      <PageHeader
        eyebrow={t(page.eyebrow)}
        title={t(page.title)}
        subtitle={t(page.intro)}
      />
      {page.sections.map((s, i) => (
        <SectionBlock key={i} section={s} />
      ))}
    </Section>
  );
}

/**
 * An application page — the content sections plus the real enquiry form.
 *
 * The DApp has no form backend, so submitting composes an email to the team
 * rather than silently dropping the enquiry. Required fields and the mandatory
 * consents are enforced before that happens.
 */
export function ContentFormPage({ page }: { page: FormPage }) {
  const { t } = useI18n();
  const [values, setValues] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState<Record<number, boolean>>({});

  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const missingField = page.fields.find(
    (f) => f.required && !values[f.label]?.trim(),
  );
  const missingConsent = page.consents.some((c, i) => c.required && !agreed[i]);

  const submit = () => {
    if (missingField) {
      toast.error(t("Please complete the required fields"), {
        description: missingField.label,
      });
      return;
    }
    if (missingConsent) {
      toast.error(t("Please accept the required consents"));
      return;
    }

    // Labels are translated for the email itself; `values` stays keyed by the
    // untranslated `f.label` throughout, so the language toggle never loses
    // in-progress input.
    const body = page.fields
      .map((f) => `${t(f.label)}: ${values[f.label] || "-"}`)
      .concat(
        page.consents.map(
          (c, i) => `${t(c.label)} ${agreed[i] ? "Y" : "N"}`,
        ),
      )
      .join("\n");

    window.location.href = `mailto:${page.mailto}?subject=${encodeURIComponent(
      t(page.title),
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Section className="py-14">
      <PageHeader
        eyebrow={t(page.eyebrow)}
        title={t(page.title)}
        subtitle={t(page.intro)}
      />

      {page.sections.map((s, i) => (
        <SectionBlock key={i} section={s} />
      ))}

      <Card className="mt-14 max-w-3xl" ornament>
        <div className="eyebrow mb-2">{t("Application")}</div>
        <h2 className="font-engraved text-2xl font-medium">
          {t("Partner Consultation Application")}
        </h2>
        <hr className="rule-gold mt-4 mb-6 max-w-xs" />

        <div className="grid sm:grid-cols-2 gap-4">
          {page.fields.map((f) => (
            <label
              key={f.label}
              className={f.type === "textarea" ? "sm:col-span-2 block" : "block"}
            >
              <span className="text-xs text-muted-foreground">
                {t(f.label)}
                {f.required && <span className="text-gold"> *</span>}
              </span>
              {f.options ? (
                <select
                  value={values[f.label] || ""}
                  onChange={(e) => set(f.label, e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm"
                >
                  {f.options.map((o) => (
                    <option key={o} value={o === f.options![0] ? "" : o}>
                      {t(o)}
                    </option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  rows={4}
                  placeholder={f.placeholder}
                  value={values[f.label] || ""}
                  onChange={(e) => set(f.label, e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm"
                />
              ) : (
                <input
                  type={f.type || "text"}
                  placeholder={f.placeholder}
                  value={values[f.label] || ""}
                  onChange={(e) => set(f.label, e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm"
                />
              )}
            </label>
          ))}
        </div>

        <hr className="rule-gold my-6" />
        <div className="eyebrow mb-3">
          {t("Personal Information Consent")}
        </div>

        {page.legalNotice && (
          <div className="mb-4 p-4 rounded-md tile text-xs text-muted-foreground space-y-3 max-h-48 overflow-y-auto">
            {page.legalNotice.map((n) => (
              <div key={n.title}>
                <div className="font-semibold text-foreground mb-0.5">
                  {t(n.title)}
                </div>
                <div>{t(n.body)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2.5">
          {page.consents.map((c, i) => (
            <label key={c.label} className="flex gap-2.5 items-start text-sm">
              <input
                type="checkbox"
                checked={!!agreed[i]}
                onChange={(e) =>
                  setAgreed((p) => ({ ...p, [i]: e.target.checked }))
                }
                className="mt-1 accent-[var(--gold)]"
              />
              <span className="text-muted-foreground">{t(c.label)}</span>
            </label>
          ))}
        </div>

        {page.consentFootnote && (
          <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
            {t(page.consentFootnote)}
          </p>
        )}

        <GoldButton className="w-full mt-7" onClick={submit}>
          {t(page.submitLabel)}
        </GoldButton>
        <p className="mt-3 text-[11px] text-muted-foreground text-center">
          {t("Your enquiry opens in your email app, addressed to")}{" "}
          <span className="text-gold-lift">{page.mailto}</span>
        </p>
      </Card>
    </Section>
  );
}
