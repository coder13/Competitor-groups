const crypto = require('crypto');

const headers = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

const base64Url = (value) => Buffer.from(value).toString('base64url');
const REMOTE_SCOPE = 'notifycomp.remote';
const PUSH_SCOPE = 'assignment_notifications';
const REMOTE_TOKEN_TTL_SECONDS = 12 * 60 * 60;
const PUSH_TOKEN_TTL_SECONDS = 10 * 60;

const signJwt = (claims, secret) => {
  const encodedHeader = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const encodedPayload = base64Url(JSON.stringify(claims));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  const secret = process.env.COMPETITION_GROUPS_JWT_SECRET;
  if (!secret) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Notification token secret is not configured' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'Invalid JSON body' }),
    };
  }

  const { accessToken, competitionId, scope } = body;
  if (!accessToken) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'Missing WCA access token' }),
    };
  }

  const wcaOrigin = process.env.WCA_ORIGIN || 'https://www.worldcubeassociation.org';
  const meResponse = await fetch(`${wcaOrigin}/api/v0/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!meResponse.ok) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ message: 'Invalid WCA access token' }),
    };
  }

  const { me } = await meResponse.json();
  if (!me?.id) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ message: 'Unable to resolve WCA user' }),
    };
  }

  const tokenScope = scope === REMOTE_SCOPE ? REMOTE_SCOPE : PUSH_SCOPE;
  const tokenTtlSeconds =
    tokenScope === REMOTE_SCOPE ? REMOTE_TOKEN_TTL_SECONDS : PUSH_TOKEN_TTL_SECONDS;
  if (tokenScope === REMOTE_SCOPE && !competitionId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'Missing competition ID for remote token' }),
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const token = signJwt(
    {
      aud: process.env.COMPETITION_GROUPS_JWT_AUDIENCE || 'notifycomp',
      competitionIds: tokenScope === REMOTE_SCOPE ? [competitionId] : undefined,
      exp: now + tokenTtlSeconds,
      iat: now,
      iss: process.env.COMPETITION_GROUPS_JWT_ISSUER || 'competitiongroups.com',
      name: me.name,
      scope: tokenScope,
      scopes: [tokenScope],
      sub: `wca:${me.id}`,
      wcaUserId: me.id,
      wcaUserIds: [me.id],
    },
    secret,
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ token }),
  };
};
