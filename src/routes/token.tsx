import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/ContentPage";
import { TOKEN } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/token")({
  head: () => ({ meta: [{ title: `${TOKEN.nav} — ${BRAND.name}` }] }),
  component: () => <ContentPage page={TOKEN} />,
});
