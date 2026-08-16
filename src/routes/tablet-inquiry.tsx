import { createFileRoute } from "@tanstack/react-router";
import { ContentFormPage } from "@/components/ContentPage";
import { TABLET_INQUIRY } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/tablet-inquiry")({
  head: () => ({ meta: [{ title: `${TABLET_INQUIRY.nav} — ${BRAND.name}` }] }),
  component: () => <ContentFormPage page={TABLET_INQUIRY} />,
});
