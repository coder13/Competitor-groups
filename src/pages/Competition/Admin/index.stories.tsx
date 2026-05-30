import type { Meta, StoryObj } from '@storybook/react';
import { storybookCompetitionFixture } from '@/storybook/competitionFixtures';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import CompetitionAdmin from './index';

const adminUser: User = {
  id: 9001,
  name: 'Nick Silvestri',
  email: '',
  wca_id: '2016SILV08',
  avatar: {
    url: 'https://avatars.worldcubeassociation.org/nsg38gkpoch8xiji3hodmrs672m4',
    thumb_url: 'https://avatars.worldcubeassociation.org/uge6fzvlpmz6c8ztn8ey5wi4i8uf',
  },
  delegate_status: 'delegate',
};

const nonAdminUser: User = {
  id: 1005,
  name: 'Eva Park',
  email: '',
  wca_id: '2026PARK05',
  avatar: {
    url: '',
    thumb_url: '',
  },
  delegate_status: '',
};

const meta = {
  title: 'Pages/Competition/Admin',
  component: CompetitionAdmin,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionAdmin>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AvailableTools: Story = {
  parameters: {
    competition: storybookCompetitionFixture,
    currentUser: adminUser,
  },
};

export const NoAvailableTools: Story = {
  parameters: {
    competition: storybookCompetitionFixture,
    currentUser: nonAdminUser,
  },
};
