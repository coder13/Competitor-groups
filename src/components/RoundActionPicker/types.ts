import { LinkRenderer } from '@/lib/linkRenderer';

export type RoundActionPickerMode = 'groups' | 'results';

export interface RoundActionPickerRound {
  id: string;
  roundNumber: number;
  groupCount?: number;
  resultStatus?: 'now' | 'done';
  href?: string;
}

export interface RoundActionPickerEvent {
  id: string;
  name: string;
  rounds: RoundActionPickerRound[];
}

export interface RoundActionPickerProps {
  mode: RoundActionPickerMode;
  events: RoundActionPickerEvent[];
  LinkComponent?: LinkRenderer;
}
