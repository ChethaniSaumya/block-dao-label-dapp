import { createFileRoute } from "@tanstack/react-router";
import { ArticleDetailPage } from "@/components/ArticleDetailPage";
import { NEWS_ARTICLES } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

const article = NEWS_ARTICLES.find((a) => a.slug === "moripe-samsung-b2b")!;

export const Route = createFileRoute("/news/moripe-samsung-b2b")({
  head: () => ({ meta: [{ title: `${article.title} — ${BRAND.name}` }] }),
  component: () => (
    <ArticleDetailPage
      title={article.title}
      meta={`${article.source} · ${article.date}`}
      paragraphs={article.paragraphs}
      backTo="/news"
      backLabel="Back to List"
    />
  ),
});
