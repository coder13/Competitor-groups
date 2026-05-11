export interface PushSubscriptionRecord {
  id: string;
  userId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSnapshot {
  competitionId: string;
  personWcaUserId: number;
  assignmentsHash: string;
  fetchedAt: string;
}

export interface NotificationJob {
  id: string;
  userId: number;
  competitionId: string;
  title: string;
  body: string;
  dedupeKey: string;
  createdAt: string;
}

export interface WcifPerson {
  wcaUserId: number;
  name: string;
  assignments?: unknown;
}

export interface WcifPayload {
  id: string;
  name: string;
  persons: WcifPerson[];
}

export interface ServiceStore {
  snapshots: AssignmentSnapshot[];
  subscriptions: PushSubscriptionRecord[];
  deliveredDedupeKeys: string[];
}
