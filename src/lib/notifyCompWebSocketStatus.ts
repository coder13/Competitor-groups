export type NotifyCompWebSocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected';

export interface NotifyCompWebSocketStatusState {
  message?: string;
  status: NotifyCompWebSocketStatus;
}

type Listener = () => void;

let state: NotifyCompWebSocketStatusState = {
  status: 'idle',
};
const listeners = new Set<Listener>();

export const getNotifyCompWebSocketStatus = () => state;

export const subscribeToNotifyCompWebSocketStatus = (listener: Listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const setNotifyCompWebSocketStatus = (nextState: NotifyCompWebSocketStatusState) => {
  state = nextState;
  listeners.forEach((listener) => listener());
};

export const canUseNotifyCompRemoteControls = (status: NotifyCompWebSocketStatus) =>
  status === 'connected';
