interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  COMPETITION_GROUPS_JWT_SECRET: string;
  COMPETITION_GROUPS_JWT_AUDIENCE?: string;
  COMPETITION_GROUPS_JWT_ISSUER?: string;
  WCA_ORIGIN?: string;
}

interface WcaUser {
  id: number;
  name?: string;
}

interface WcaCompetition {
  id?: string;
  organizers?: WcaUser[];
  delegates?: WcaUser[];
  competition?: WcaCompetition;
}

interface WcaMeResponse {
  me?: WcaUser;
  ongoing_competitions?: WcaCompetition[];
  upcoming_competitions?: WcaCompetition[];
}

const TOKEN_PATH = '/api/notify-comp-token';
const REMOTE_SCOPE = 'notifycomp.remote';
const PUSH_SCOPE = 'assignment_notifications';
const REMOTE_TOKEN_TTL_SECONDS = 12 * 60 * 60;
const PUSH_TOKEN_TTL_SECONDS = 10 * 60;
const responseHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

const jsonResponse = (status: number, body?: Record<string, unknown>) =>
  new Response(body ? JSON.stringify(body) : null, { status, headers: responseHeaders });

const base64Url = (bytes: Uint8Array) => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const encodeBase64Url = (value: string) => base64Url(new TextEncoder().encode(value));

const signJwt = async (claims: Record<string, unknown>, secret: string) => {
  const encodedHeader = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const encodedPayload = encodeBase64Url(JSON.stringify(claims));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(unsignedToken));

  return `${unsignedToken}.${base64Url(new Uint8Array(signature))}`;
};

const getCompetitionManagers = (competition: WcaCompetition) => {
  const data = competition.competition || competition;
  return [...(data.organizers || []), ...(data.delegates || [])];
};

const isListedCompetitionManager = (competition: WcaCompetition, userId: number) =>
  getCompetitionManagers(competition).some((user) => Number(user.id) === Number(userId));

const getManagedCompetitionIds = (competitions: WcaCompetition[], userId: number) =>
  competitions
    .filter((competition) => isListedCompetitionManager(competition, userId))
    .map((competition) => competition.id)
    .filter((id): id is string => Boolean(id));

const handleTokenRequest = async (request: Request, env: Env) => {
  if (request.method === 'OPTIONS') return jsonResponse(204);
  if (request.method !== 'POST') return jsonResponse(405, { message: 'Method not allowed' });
  if (!env.COMPETITION_GROUPS_JWT_SECRET) {
    return jsonResponse(500, { message: 'Notification token secret is not configured' });
  }

  let body: { accessToken?: string; competitionId?: string; scope?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonResponse(400, { message: 'Invalid JSON body' });
  }

  const { accessToken, competitionId, scope } = body;
  const tokenScope = scope === REMOTE_SCOPE ? REMOTE_SCOPE : PUSH_SCOPE;
  if (!accessToken) return jsonResponse(400, { message: 'Missing WCA access token' });
  if (tokenScope === REMOTE_SCOPE && !competitionId) {
    return jsonResponse(400, { message: 'Missing competition ID for remote token' });
  }

  const wcaOrigin = env.WCA_ORIGIN || 'https://www.worldcubeassociation.org';
  const meParams =
    tokenScope === REMOTE_SCOPE ? '?upcoming_competitions=true&ongoing_competitions=true' : '';
  const meResponse = await fetch(`${wcaOrigin}/api/v0/me${meParams}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!meResponse.ok) return jsonResponse(401, { message: 'Invalid WCA access token' });

  const {
    me,
    ongoing_competitions = [],
    upcoming_competitions = [],
  } = (await meResponse.json()) as WcaMeResponse;
  if (!me?.id) return jsonResponse(401, { message: 'Unable to resolve WCA user' });

  let remoteCompetitionIds: string[] = [];
  if (tokenScope === REMOTE_SCOPE) {
    const competitionResponse = await fetch(
      `${wcaOrigin}/api/v0/competitions/${encodeURIComponent(competitionId!)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!competitionResponse.ok) {
      return jsonResponse(competitionResponse.status === 404 ? 404 : 502, {
        message: 'Unable to verify competition remote access',
      });
    }

    const competition = (await competitionResponse.json()) as WcaCompetition;
    if (!isListedCompetitionManager(competition, me.id)) {
      return jsonResponse(403, {
        message: 'Only listed competition delegates and organizers can use Live Activities Remote',
      });
    }

    remoteCompetitionIds = [
      ...new Set([
        competitionId!,
        ...getManagedCompetitionIds([...ongoing_competitions, ...upcoming_competitions], me.id),
      ]),
    ];
  }

  const now = Math.floor(Date.now() / 1000);
  const token = await signJwt(
    {
      aud: env.COMPETITION_GROUPS_JWT_AUDIENCE || 'notifycomp',
      competitionIds: tokenScope === REMOTE_SCOPE ? remoteCompetitionIds : undefined,
      exp: now + (tokenScope === REMOTE_SCOPE ? REMOTE_TOKEN_TTL_SECONDS : PUSH_TOKEN_TTL_SECONDS),
      iat: now,
      iss: env.COMPETITION_GROUPS_JWT_ISSUER || 'competitiongroups.com',
      name: me.name,
      scope: tokenScope,
      scopes: [tokenScope],
      sub: `wca:${me.id}`,
      wcaUserId: me.id,
      wcaUserIds: [me.id],
    },
    env.COMPETITION_GROUPS_JWT_SECRET,
  );

  return jsonResponse(200, { token });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === TOKEN_PATH) return handleTokenRequest(request, env);
    return env.ASSETS.fetch(request);
  },
};
