export const BUILD_QUEUE_NAME = "builds";

export interface BuildJobData {
  engagementId: string;
  repoUrl: string;
  commitSha: string;
}
