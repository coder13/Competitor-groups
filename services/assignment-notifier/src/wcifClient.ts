import type { WcifPayload } from './types';

export async function fetchWcif(
  competitionId: string,
  options: { apiBaseUrl: string; token: string },
): Promise<WcifPayload> {
  const response = await fetch(`${options.apiBaseUrl}/competitions/${competitionId}/wcif`, {
    headers: {
      Authorization: `Bearer ${options.token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch WCIF for ${competitionId}: ${response.status}`);
  }

  return (await response.json()) as WcifPayload;
}
