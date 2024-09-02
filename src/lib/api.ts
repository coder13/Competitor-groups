import { Competition } from '@wca/helpers';
import { WCA_ORIGIN } from './wca-env';

export const wcaApiFetch = async <T>(path: string, fetchOptions: RequestInit = {}) => {
  const res = await fetch(`${WCA_ORIGIN}${path}`, fetchOptions);

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return (await res.json()) as T;
};

export const fetchMe = async (accessToken: string) =>
  wcaApiFetch<{ me: User }>('/me', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const fetchUser = async (userId: string) => wcaApiFetch<{ user: User }>(`/users/${userId}`);

const fetchUserWithCompetitionsParams = new URLSearchParams({
  upcoming_competitions: 'true',
  ongoing_competitions: 'true',
});

export interface UserCompsResponse {
  user: User;
  upcoming_competitions: ApiCompetition[];
  ongoing_competitions: ApiCompetition[];
}

export const fetchUserWithCompetitions = async (userId: string) =>
  wcaApiFetch<UserCompsResponse>(`/users/${userId}?${fetchUserWithCompetitionsParams.toString()}`);

export const fetchWcif = async (competitionId: string) =>
  wcaApiFetch<Competition>(`/competitions/${competitionId}/wcif/public`);

export const fetchCompetition = async (competitionId: string) =>
  await wcaApiFetch<ApiCompetition>(`/competitions/${competitionId}`);
