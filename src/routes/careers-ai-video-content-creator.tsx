import { createFileRoute } from "@tanstack/react-router";
import { JobDetailPage } from "@/components/JobDetailPage";
import { JOBS } from "@/lib/site-content";
import { BRAND } from "@/lib/brand";

const job = JOBS.find((j) => j.slug === "ai-video-content-creator")!;

export const Route = createFileRoute("/careers/ai-video-content-creator")({
  head: () => ({ meta: [{ title: `${job.title} — ${BRAND.name}` }] }),
  component: () => <JobDetailPage job={job} />,
});
