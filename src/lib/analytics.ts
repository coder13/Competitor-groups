type AnalyticsPrimitive = string | number | boolean | null | undefined;

export type AnalyticsProperties = Record<string, AnalyticsPrimitive>;

type UmamiTrack = {
  track: (eventName: string, eventData?: AnalyticsProperties) => void;
  identify?: ((id: string, data?: AnalyticsProperties) => void) &
    ((data: AnalyticsProperties) => void);
};

type PendingEvent = {
  eventName: string;
  properties?: AnalyticsProperties;
};

const APP_NAME = 'competitiongroups';
const MAX_EVENT_NAME_LENGTH = 50;
const MAX_PENDING_EVENTS = 50;
const UMAMI_SCRIPT_ID = 'umami-analytics-script';

let currentUserId: string | undefined;
let pendingEvents: PendingEvent[] = [];
let umamiConfigured = false;

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

export const configureUmamiAnalytics = ({
  src,
  websiteId,
}: {
  src?: string;
  websiteId?: string;
} = {}) => {
  umamiConfigured = Boolean(src && websiteId);
};

const sendEvent = (eventName: string, properties?: AnalyticsProperties) => {
  const umami = getUmami();
  if (!umami?.track) {
    return false;
  }

  umami.track(eventName, eventProperties(properties));
  return true;
};

const queueEvent = (eventName: string, properties?: AnalyticsProperties) => {
  if (!umamiConfigured) {
    return;
  }

  pendingEvents = [...pendingEvents.slice(-(MAX_PENDING_EVENTS - 1)), { eventName, properties }];
};

const identifyCurrentUser = () => {
  const umami = getUmami();
  if (!umami?.identify || !currentUserId) {
    return false;
  }

  umami.identify(currentUserId, {
    ...baseProperties(),
    auth_status: 'logged_in',
  });
  return true;
};

const flushPendingEvents = () => {
  if (!pendingEvents.length) {
    identifyCurrentUser();
    return;
  }

  const events = pendingEvents;
  pendingEvents = [];

  events.forEach(({ eventName, properties }) => {
    if (!sendEvent(eventName, properties)) {
      queueEvent(eventName, properties);
    }
  });

  identifyCurrentUser();
};

export const loadUmamiScript = ({
  src,
  websiteId,
}: {
  src?: string;
  websiteId?: string;
} = {}) => {
  if (!isBrowser() || !src || !websiteId) {
    return;
  }

  configureUmamiAnalytics({ src, websiteId });

  if (document.getElementById(UMAMI_SCRIPT_ID)) {
    flushPendingEvents();
    return;
  }

  const script = document.createElement('script');
  script.id = UMAMI_SCRIPT_ID;
  script.defer = true;
  script.src = src;
  script.dataset.websiteId = websiteId;
  script.addEventListener('load', flushPendingEvents);
  document.head.appendChild(script);
};

export const identifyUser = (userId?: number | string | null) => {
  currentUserId = userId ? String(userId) : undefined;
  identifyCurrentUser();
};

export const trackEvent = (eventName: string, properties?: AnalyticsProperties) => {
  if (!isValidEventName(eventName)) {
    if (getEnvironment() === 'development') {
      console.warn(`Skipping Umami event with invalid name: ${eventName}`);
    }
    return;
  }

  if (!sendEvent(eventName, properties)) {
    queueEvent(eventName, properties);
  }
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

export const __resetAnalyticsForTests = () => {
  currentUserId = undefined;
  pendingEvents = [];
  umamiConfigured = false;
};
