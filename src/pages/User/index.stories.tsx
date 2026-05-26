import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient } from '@tanstack/react-query';
import { WcaCompetitionResult, WcaPersonCompetition } from '@/lib/api';
import {
  makeAppContainerDecorator,
  storybookAppUser,
  storybookUserCompetitions,
} from '@/storybook/appStorybook';
import UserPage from './index';
import { WcaPersonResponse } from './userProfileData';

const profile: WcaPersonResponse = {
  person: {
    country_iso2: 'US',
  },
  personal_records: {
    '333': {
      single: {
        best: 486,
        world_rank: 236,
        continent_rank: 62,
        country_rank: 53,
      },
      average: {
        best: 675,
        world_rank: 360,
        continent_rank: 99,
        country_rank: 83,
      },
    },
    '222': {
      single: {
        best: 91,
        world_rank: 693,
        continent_rank: 194,
        country_rank: 151,
      },
    },
  },
};

const results: WcaCompetitionResult[] = [
  {
    id: 1,
    pos: 5,
    best: 958,
    average: 1108,
    name: storybookAppUser.name,
    country_iso2: 'US',
    competition_id: 'LakewoodSpring2026',
    event_id: '333',
    round_type_id: '1',
    format_id: 'a',
    wca_id: storybookAppUser.wca_id,
    attempts: [],
  },
  {
    id: 2,
    pos: 3,
    best: 91,
    average: 218,
    name: storybookAppUser.name,
    country_iso2: 'US',
    competition_id: 'LakewoodSpring2026',
    event_id: '222',
    round_type_id: 'f',
    format_id: 'a',
    wca_id: storybookAppUser.wca_id,
    attempts: [],
  },
];

const pastCompetitions: WcaPersonCompetition[] = [
  {
    id: 'LakewoodSpring2026',
    name: 'Lakewood Spring 2026',
    short_name: 'Lakewood Spring 2026',
    city: 'Lakewood, Washington',
    country_iso2: 'US',
    start_date: '2026-03-14',
    end_date: '2026-03-15',
    announced_at: '2025-12-10T00:00:00Z',
    cancelled_at: '',
    latitude_degrees: 47.1718,
    longitude_degrees: -122.5185,
    venue_address: '5000 Steilacoom Blvd SW',
    venue_details: '',
    website: 'https://www.worldcubeassociation.org/competitions/LakewoodSpring2026',
  },
  {
    id: 'TacomaWinter2025',
    name: 'Tacoma Winter 2025',
    short_name: 'Tacoma Winter 2025',
    city: 'Tacoma, Washington',
    country_iso2: 'US',
    start_date: '2025-12-06',
    end_date: '2025-12-06',
    announced_at: '2025-08-01T00:00:00Z',
    cancelled_at: '',
    latitude_degrees: 47.2529,
    longitude_degrees: -122.4443,
    venue_address: '1500 Commerce St',
    venue_details: '',
    website: 'https://www.worldcubeassociation.org/competitions/TacomaWinter2025',
  },
];

const meta = {
  title: 'Pages/User/Profile',
  component: UserPage,
  decorators: [
    makeAppContainerDecorator({
      currentUser: storybookAppUser,
      userCompetitions: storybookUserCompetitions,
      configureQueryClient: (queryClient: QueryClient) => {
        queryClient.setQueryData(['user-profile', storybookAppUser.wca_id], profile);
        queryClient.setQueryData(['user-results', storybookAppUser.wca_id], results);
        queryClient.setQueryData(
          ['user-past-competitions', storybookAppUser.wca_id],
          pastCompetitions,
        );
        queryClient.setQueryData(
          [
            'user-assignment-status',
            storybookAppUser.id,
            [
              ...storybookUserCompetitions.upcoming_competitions,
              ...storybookUserCompetitions.ongoing_competitions,
            ]
              .map((competition) => competition.id)
              .join(','),
          ],
          {
            PortlandAutumn2026: true,
            SeattleSummerOpen2026: false,
          },
        );
      },
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof UserPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
