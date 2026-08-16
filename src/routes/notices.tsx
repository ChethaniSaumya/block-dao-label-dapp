import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/ContentPage";
import { NOTICES } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/notices")({
  head: () => ({ meta: [{ title: `${NOTICES.nav} — ${BRAND.name}` }] }),
  component: () => <ContentPage page={NOTICES} />,
});
