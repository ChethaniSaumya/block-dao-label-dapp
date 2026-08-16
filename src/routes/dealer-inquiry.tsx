import { createFileRoute } from "@tanstack/react-router";
import { ContentFormPage } from "@/components/ContentPage";
import { DEALER_INQUIRY } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/dealer-inquiry")({
  head: () => ({ meta: [{ title: `${DEALER_INQUIRY.nav} — ${BRAND.name}` }] }),
  component: () => <ContentFormPage page={DEALER_INQUIRY} />,
});
