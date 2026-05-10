import { ProjectDetail } from "@/components/project-detail";
import { getProjectById, isDatabaseConfigured } from "@/lib/projects";

type ProjectDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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
