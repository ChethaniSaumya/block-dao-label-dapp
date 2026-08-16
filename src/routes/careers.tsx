import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/ContentPage";
import { CAREERS } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/careers")({
  head: () => ({ meta: [{ title: `${CAREERS.nav} — ${BRAND.name}` }] }),
  component: () => <ContentPage page={CAREERS} />,
});
