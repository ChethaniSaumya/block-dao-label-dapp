import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/ContentPage";
import { TECHNOLOGY } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/technology")({
  head: () => ({ meta: [{ title: `${TECHNOLOGY.nav} — ${BRAND.name}` }] }),
  component: () => <ContentPage page={TECHNOLOGY} />,
});
