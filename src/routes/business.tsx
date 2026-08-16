import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/ContentPage";
import { BUSINESS } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/business")({
  head: () => ({ meta: [{ title: `${BUSINESS.nav} — ${BRAND.name}` }] }),
  component: () => <ContentPage page={BUSINESS} />,
});
