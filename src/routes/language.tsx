import { createFileRoute } from "@tanstack/react-router";
import { Section, Card, GoldButton, PageHeader } from "@/components/ui-bits";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/language")({
  head: () => ({ meta: [{ title: `Language — ${BRAND.name}` }] }),
  component: Language,
});

const langs = [
  { code: "en", flag: "🇺🇸", name: "English" },
  { code: "kr", flag: "🇰🇷", name: "한국어" },
] as const;

function Language() {
  const { t, lang, setLang } = useI18n();
  return (
    <Section className="py-12">
      <PageHeader
        title={t("Language Settings")}
        subtitle={t("Choose your preferred display language.")}
      />

      <Card className="mb-6">
        <div className="text-sm text-muted-foreground">
          {t("Current Language")}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-3xl">
            {langs.find((l) => l.code === lang)?.flag}
          </span>
          <span className="font-display text-2xl font-semibold">
            {langs.find((l) => l.code === lang)?.name}
          </span>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        {langs.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`text-left rounded-xl border p-6 transition ${lang === l.code ? "border-[oklch(0.2_0_0)] shadow-gold bg-card" : "border-border bg-card hover:border-[oklch(0.2_0_0_/_40%)]"}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-4xl">{l.flag}</span>
              {lang === l.code && (
                <Check className="w-5 h-5 text-[oklch(0.2_0_0)]" />
              )}
            </div>
            <div className="mt-4 font-display text-xl font-semibold">
              {l.name}
            </div>
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {t("More languages coming soon — Japanese, Chinese, Thai")}
      </p>

      <GoldButton
        className="mt-8"
        onClick={() => toast.success("Language applied")}
      >
        {t("Apply Language")}
      </GoldButton>
    </Section>
  );
}
