import type { Preview } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import '../src/i18n';
import '../src/styles/index.scss';

const mobileViewports = {
  androidTypical: {
    name: 'Android Typical',
    styles: {
      width: '360px',
      height: '800px',
    },
    type: 'mobile',
  },
  iphoneModern: {
    name: 'iPhone Modern',
    styles: {
      width: '393px',
      height: '852px',
    },
    type: 'mobile',
  },
  phoneLegacy: {
    name: 'Phone 2016',
    styles: {
      width: '375px',
      height: '667px',
    },
    type: 'mobile',
  },
};

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
      defaultViewport: 'androidTypical',
      options: mobileViewports,
    },
  },
};

export default preview;
