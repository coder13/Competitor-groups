import type { Meta, StoryObj } from '@storybook/react';
import { storybookCompetitionFixture } from '@/storybook/competitionFixtures';
import { PersonalBestsContainer } from './PersonalBests';

const competitor = storybookCompetitionFixture.persons.find((person) => person.registrantId === 1);
const singleOnlyCompetitor = storybookCompetitionFixture.persons.find(
  (person) => person.registrantId === 3,
);

if (!competitor || !singleOnlyCompetitor) {
  throw new Error('Missing storybook person fixtures for PersonalBests stories');
}

const meta = {
  title: 'Containers/Competition/PersonalBests',
  component: PersonalBestsContainer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PersonalBestsContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    wcif: storybookCompetitionFixture,
    person: competitor,
  },
};

export const SingleOnly: Story = {
  args: {
    wcif: storybookCompetitionFixture,
    person: singleOnlyCompetitor,
  },
};
