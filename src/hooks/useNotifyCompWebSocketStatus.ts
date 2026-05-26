import { useSyncExternalStore } from 'react';
import {
  getNotifyCompWebSocketStatus,
  subscribeToNotifyCompWebSocketStatus,
} from '@/lib/notifyCompWebSocketStatus';

export const useNotifyCompWebSocketStatus = () =>
  useSyncExternalStore(
    subscribeToNotifyCompWebSocketStatus,
    getNotifyCompWebSocketStatus,
    getNotifyCompWebSocketStatus,
  );
