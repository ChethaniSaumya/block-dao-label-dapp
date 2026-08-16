import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/ContentPage";
import { CONTACT } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: `${CONTACT.nav} — ${BRAND.name}` }] }),
  component: () => <ContentPage page={CONTACT} />,
});
