import { createFileRoute } from "@tanstack/react-router";
import { ArticleDetailPage } from "@/components/ArticleDetailPage";
import { NOTICE_POSTS } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

const notice = NOTICE_POSTS.find((n) => n.slug === "demo-sourcing")!;

export const Route = createFileRoute("/notices/demo-sourcing")({
  head: () => ({ meta: [{ title: `${notice.title} — ${BRAND.name}` }] }),
  component: () => (
    <ArticleDetailPage
      badge={`NOTICE ${notice.number}`}
      title={notice.title}
      meta={notice.date}
      paragraphs={notice.paragraphs}
      backTo="/notices"
      backLabel="Back to List"
    />
  ),
});
