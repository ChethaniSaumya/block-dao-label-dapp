import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/ContentPage";
import { NEWS } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: `${NEWS.nav} — ${BRAND.name}` }] }),
  component: () => <ContentPage page={NEWS} />,
});
