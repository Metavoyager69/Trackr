import { ProjectDetail } from "@/components/project-detail";
import { getProjectById } from "@/lib/projects";
import { isDatabaseConfigured } from "@/lib/prisma";
import type { Metadata } from "next";

type ProjectDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params
}: ProjectDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  return {
    title: project ? `${project.name} | SiteLog` : "Project Detail | SiteLog",
    description: project ? project.goalSummary : "View project detail"
  };
}

export default async function ProjectDetailPage({
  params
}: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);
  const databaseConfigured = isDatabaseConfigured();

  return (
    <ProjectDetail
      databaseConfigured={databaseConfigured}
      project={project}
    />
  );
}
