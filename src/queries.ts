import { gql, useQuery, useSubscription } from '@apollo/client';

export const useCompetitionsQuery = () => {
  return useQuery<{
    competitions: {
      id: string;
      name: string;
      startDate: string;
      endDate: string;
      country: string;
    }[];
  }>(gql`
    query GetCompetitions {
      competitions {
        id
        name
        startDate
        endDate
        country
        __typename
      }
    }
  `);
};

export const useActivitiesQuery = (competitionId: string) => {
  return useQuery<{
    activities: {
      activityId: number;
      startTime: string;
      endTime: string;
    }[];
  }>(
    gql`
      query Activities($competitionId: String!) {
        activities(competitionId: $competitionId) {
          activityId
          startTime
          endTime
        }
      }
    `,
    {
      variables: {
        competitionId,
      },
      skip: !competitionId,
    },
  );
};

export const ActivitiesSubscriptionDocument = gql`
  subscription Activities($competitionIds: [String!]!) {
    activity: activityUpdated(competitionIds: $competitionIds) {
      activityId
      startTime
      endTime
    }
  }
`;

export const useActivitiesSubscription = (competitionId: string) => {
  return useSubscription<{
    activity: NotifyCompActivity;
  }>(ActivitiesSubscriptionDocument, {
    variables: {
      competitionIds: [competitionId],
    },
    skip: !competitionId,
  });
};

export interface NotifyCompActivity {
  activityId: number;
  startTime: string;
  endTime: string;
}
