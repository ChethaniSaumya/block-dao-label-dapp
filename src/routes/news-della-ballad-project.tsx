import { createFileRoute } from "@tanstack/react-router";
import { ArticleDetailPage } from "@/components/ArticleDetailPage";
import { NEWS_ARTICLES } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

const article = NEWS_ARTICLES.find((a) => a.slug === "della-ballad-project")!;

export const Route = createFileRoute("/news/della-ballad-project")({
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
