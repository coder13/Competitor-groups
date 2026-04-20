import ViteYaml from '@modyfi/vite-plugin-yaml';
import type { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';
import { mergeConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: '.storybook/no-vite-config.ts',
      },
    },
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) =>
    mergeConfig(config, {
      plugins: [viteTsconfigPaths(), ViteYaml()],
      resolve: {
        alias: {
          'virtual:pwa-register': path.resolve(__dirname, './mocks/pwa-register.ts'),
        },
      },
      define: {
        __GIT_COMMIT__: JSON.stringify('storybook'),
        __GIT_TAG__: JSON.stringify(''),
      },
    }),
};

export default config;
