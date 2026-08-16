import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/ContentPage";
import { DEALERS } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/dealers")({
  head: () => ({ meta: [{ title: `${DEALERS.nav} — ${BRAND.name}` }] }),
  component: () => <ContentPage page={DEALERS} />,
});
