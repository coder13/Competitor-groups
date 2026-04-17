import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionLayout } from './CompetitionLayout';

const CompetitionLayoutStoryFrame = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/competitions/SeattleSummerOpen2026/live', { replace: true });
  }, [navigate]);

  return (
    <Routes>
      <Route path="/competitions/:competitionId/*" element={<CompetitionLayout />}>
        <Route
          path="*"
          element={
            <div className="flex w-full justify-center p-6">
              <div className="w-full max-w-screen-md rounded-md bg-panel p-6">
                Competition layout outlet content
              </div>
            </div>
          }
        />
      </Route>
    </Routes>
  );
};

const meta = {
  title: 'Layouts/CompetitionLayout',
  component: CompetitionLayout,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <CompetitionLayoutStoryFrame />,
};
