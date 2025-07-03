import ViteYaml from '@modyfi/vite-plugin-yaml';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import viteTsconfigPaths from 'vite-tsconfig-paths';

function getGitCommitHash() {
  return execSync('git rev-parse --short HEAD').toString().trim();
}

function getGitTag() {
  try {
    return execSync('git describe --tags --abbrev=0').toString().trim();
  } catch {
    return null;
  }
}

const GIT_COMMIT = getGitCommitHash();
const GIT_TAG = getGitTag();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    ViteYaml(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  define: {
    __GIT_COMMIT__: JSON.stringify(GIT_COMMIT),
    __GIT_TAG__: JSON.stringify(GIT_TAG || ''),
  },
});
