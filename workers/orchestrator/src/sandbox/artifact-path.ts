export function artifactPathFor(engagementId: string, runId: string, attempt: number): string {
  return `${engagementId}/${runId}/attempt-${attempt}`;
}
