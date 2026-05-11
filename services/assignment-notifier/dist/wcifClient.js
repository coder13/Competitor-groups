'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.fetchWcif = fetchWcif;
async function fetchWcif(competitionId, options) {
  const response = await fetch(`${options.apiBaseUrl}/competitions/${competitionId}/wcif`, {
    headers: {
      Authorization: `Bearer ${options.token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch WCIF for ${competitionId}: ${response.status}`);
  }
  return await response.json();
}
