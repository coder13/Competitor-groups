import type { Meta, StoryObj } from '@storybook/react';
import { CompetitionListItem } from './CompetitionListItem';

const meta = {
  title: 'Components/Competition/CompetitionListItem',
  component: CompetitionListItem,
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl">
        <ul className="px-0">
          <Story />
        </ul>
      </div>
    ),
  ],
  args: {
    id: 'test-competition-2026',
    name: 'Example Open 2026',
    start_date: '2026-05-03',
    end_date: '2026-05-04',
    country_iso2: 'US',
    city: 'Seattle, WA',
    isLive: false,
    isBookmarked: false,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Live: Story = {
  args: {
    isLive: true,
  },
};

export const Bookmarked: Story = {
  args: {
    isBookmarked: true,
  },
};

export const PastCompetition: Story = {
  args: {
    start_date: '2024-01-01',
    end_date: '2024-01-02',
  },
};
