import type { Meta, StoryObj } from '@storybook/react';
import { storybookCompetitionFixture } from '@/storybook/competitionFixtures';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { PersonalScheduleContainer } from './PersonalSchedule';

const competitor = storybookCompetitionFixture.persons.find((person) => person.registrantId === 1);
const delegate = storybookCompetitionFixture.persons.find((person) => person.registrantId === 6);

if (!competitor || !delegate) {
  throw new Error('Missing storybook person fixtures for PersonalSchedule stories');
}

const meta = {
  title: 'Containers/Competition/Personal Schedule',
  component: PersonalScheduleContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof PersonalScheduleContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CompetitorAssignments: Story = {
  args: {
    person: competitor,
  },
};

export const NoAssignments: Story = {
  args: {
    person: delegate,
  },
};
