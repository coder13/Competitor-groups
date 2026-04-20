import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { useEffect } from 'react';
import { makeAppContainerDecorator } from '@/storybook/appStorybook';
import { CompetitionSelect } from './CompetitionSelect';

function FetchMockDecorator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/search/competitions')) {
        return new Response(
          JSON.stringify({
            result: [
              {
                id: 'SeattleSummerOpen2026',
                name: 'Seattle Summer Open 2026',
                short_name: 'Seattle Summer Open 2026',
                city: 'Seattle, Washington',
                country_iso2: 'US',
                start_date: '2026-05-03',
                end_date: '2026-05-04',
              },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}

const meta = {
  title: 'Components/App/CompetitionSelect',
  component: CompetitionSelect,
  decorators: [
    makeAppContainerDecorator(),
    (Story) => (
      <FetchMockDecorator>
        <div className="w-full max-w-xl p-4">
          <Story />
        </div>
      </FetchMockDecorator>
    ),
  ],
  args: {
    onSelect: () => {},
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSearchResults: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.type(input, 'Seattle');
  },
};
