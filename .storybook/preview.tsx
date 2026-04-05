import type { Preview } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import '../src/i18n';
import '../src/styles/index.scss';

const preview: Preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="min-h-screen bg-app text-default">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    actions: { argTypesRegex: '^on.*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export default preview;
