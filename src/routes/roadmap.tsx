import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/ContentPage";
import { CONTENT } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/roadmap")({
  head: () => ({ meta: [{ title: `${CONTENT.nav} — ${BRAND.name}` }] }),
  component: () => <ContentPage page={CONTENT} />,
});
