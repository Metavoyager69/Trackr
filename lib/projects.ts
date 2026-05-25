export type {
  CreateProjectInput,
  Project,
  ProjectDetail,
  ProjectOption,
  ProjectSummary,
  UpdateProjectInput
} from "./project-types";

export {
  createProject,
  deleteProject,
  getProjectById,
  getProjectOptions,
  getProjects,
  updateProject
} from "./projects-data";
export { isDatabaseConfigured } from "./prisma";
