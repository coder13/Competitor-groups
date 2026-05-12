import { gql } from '@apollo/client';

export interface NotifyCompActivity {
  activityId: number;
  startTime: string | null;
  endTime: string | null;
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
}

export interface NotifyCompCompetition {
  id: string;
  autoAdvance?: boolean | null;
  autoAdvanceDelay?: number | null;
}

export const RemoteActivityFragment = gql`
  fragment RemoteActivityFragment on Activity {
    activityId
    startTime
    endTime
    scheduledStartTime
    scheduledEndTime
  }
`;

export const RemoteCompetitionDocument = gql`
  query RemoteCompetition($competitionId: String!) {
    competition(competitionId: $competitionId) {
      id
      autoAdvance
      autoAdvanceDelay
    }
  }
`;

export const RemoteActivitiesDocument = gql`
  query RemoteActivities($competitionId: String!, $roomId: Int) {
    activities(competitionId: $competitionId, roomId: $roomId) {
      ...RemoteActivityFragment
    }
  }
  ${RemoteActivityFragment}
`;

export const RemoteActivitiesSubscriptionDocument = gql`
  subscription RemoteActivities($competitionIds: [String!]!) {
    activity: activityUpdated(competitionIds: $competitionIds) {
      ...RemoteActivityFragment
    }
  }
  ${RemoteActivityFragment}
`;

export const StartRemoteActivityDocument = gql`
  mutation StartRemoteActivity($competitionId: String!, $activityId: Int!) {
    startActivity(competitionId: $competitionId, activityId: $activityId) {
      ...RemoteActivityFragment
    }
  }
  ${RemoteActivityFragment}
`;

export const StopRemoteActivityDocument = gql`
  mutation StopRemoteActivity($competitionId: String!, $activityId: Int!) {
    stopActivity(competitionId: $competitionId, activityId: $activityId) {
      ...RemoteActivityFragment
    }
  }
  ${RemoteActivityFragment}
`;

export const ResetRemoteActivityDocument = gql`
  mutation ResetRemoteActivity($competitionId: String!, $activityId: Int!) {
    resetActivity(competitionId: $competitionId, activityId: $activityId) {
      ...RemoteActivityFragment
    }
  }
  ${RemoteActivityFragment}
`;

export const StartRemoteActivitiesDocument = gql`
  mutation StartRemoteActivities($competitionId: String!, $activityIds: [Int!]!) {
    startActivities(competitionId: $competitionId, activityIds: $activityIds) {
      ...RemoteActivityFragment
    }
  }
  ${RemoteActivityFragment}
`;

export const StopRemoteActivitiesDocument = gql`
  mutation StopRemoteActivities($competitionId: String!, $activityIds: [Int!]!) {
    stopActivities(competitionId: $competitionId, activityIds: $activityIds) {
      ...RemoteActivityFragment
    }
  }
  ${RemoteActivityFragment}
`;

export const ResetRemoteActivitiesDocument = gql`
  mutation ResetRemoteActivities($competitionId: String!, $activityIds: [Int!]) {
    resetActivities(competitionId: $competitionId, activityIds: $activityIds) {
      ...RemoteActivityFragment
    }
  }
  ${RemoteActivityFragment}
`;

export const UpdateRemoteAutoAdvanceDocument = gql`
  mutation UpdateRemoteAutoAdvance(
    $competitionId: String!
    $autoAdvance: Boolean
    $autoAdvanceDelay: Int
  ) {
    updateAutoAdvance(
      competitionId: $competitionId
      autoAdvance: $autoAdvance
      autoAdvanceDelay: $autoAdvanceDelay
    ) {
      id
      autoAdvance
      autoAdvanceDelay
    }
  }
`;
