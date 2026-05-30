type AnalyticsPrimitive = string | number | boolean | null | undefined;

export type AnalyticsProperties = Record<string, AnalyticsPrimitive>;

type UmamiTrack = {
  track: (eventName: string, eventData?: AnalyticsProperties) => void;
  identify?: ((id: string, data?: AnalyticsProperties) => void) &
    ((data: AnalyticsProperties) => void);
};

const APP_NAME = 'competitiongroups';
const MAX_EVENT_NAME_LENGTH = 50;
const UMAMI_SCRIPT_ID = 'umami-analytics-script';

let currentUserId: string | undefined;

const getEnvironment = () => (typeof __APP_ENV__ === 'undefined' ? 'test' : __APP_ENV__);

const getVersion = () => {
  const gitTag = typeof __GIT_TAG__ === 'undefined' ? '' : __GIT_TAG__;
  const gitCommit = typeof __GIT_COMMIT__ === 'undefined' ? '' : __GIT_COMMIT__;

  return gitTag || gitCommit;
};

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const getUmami = () => {
  if (!isBrowser()) {
    return undefined;
  }

  return window.umami;
};

const sanitizeProperties = (properties: AnalyticsProperties = {}): AnalyticsProperties =>
  Object.fromEntries(
    Object.entries(properties).filter(([, value]) => {
      const valueType = typeof value;
      return (
        value === null ||
        valueType === 'string' ||
        valueType === 'number' ||
        valueType === 'boolean'
      );
    }),
  );

const baseProperties = (): AnalyticsProperties => ({
  app: APP_NAME,
  environment: getEnvironment(),
  version: getVersion(),
});

const eventProperties = (properties: AnalyticsProperties = {}): AnalyticsProperties => {
  const sanitized = sanitizeProperties(properties);
  const userId = sanitized.user_id ?? currentUserId;

  return {
    ...baseProperties(),
    ...sanitized,
    auth_status: userId ? 'logged_in' : 'anonymous',
    ...(userId ? { user_id: String(userId) } : {}),
  };
};

export const isValidEventName = (eventName: string) =>
  eventName.length > 0 && eventName.length <= MAX_EVENT_NAME_LENGTH;

export const loadUmamiScript = ({
  src,
  websiteId,
}: {
  src?: string;
  websiteId?: string;
} = {}) => {
  if (!isBrowser() || !src || !websiteId || document.getElementById(UMAMI_SCRIPT_ID)) {
    return;
  }

  const script = document.createElement('script');
  script.id = UMAMI_SCRIPT_ID;
  script.defer = true;
  script.src = src;
  script.dataset.websiteId = websiteId;
  document.head.appendChild(script);
};

export const identifyUser = (userId?: number | string | null) => {
  currentUserId = userId ? String(userId) : undefined;

  const umami = getUmami();
  if (!umami?.identify || !currentUserId) {
    return;
  }

  umami.identify(currentUserId, {
    ...baseProperties(),
    auth_status: 'logged_in',
  });
};

export const trackEvent = (eventName: string, properties?: AnalyticsProperties) => {
  if (!isValidEventName(eventName)) {
    if (getEnvironment() === 'development') {
      console.warn(`Skipping Umami event with invalid name: ${eventName}`);
    }
    return;
  }

  const umami = getUmami();
  if (!umami?.track) {
    return;
  }

  umami.track(eventName, eventProperties(properties));
};

export const trackCompetitionEvent = (
  eventName: string,
  properties: AnalyticsProperties & { competitionId?: string; competition_id?: string },
) => {
  const { competitionId, ...rest } = properties;

  trackEvent(eventName, {
    ...rest,
    competition_id: properties.competition_id ?? competitionId,
  });
};

declare global {
  interface Window {
    umami?: UmamiTrack;
  }
}
