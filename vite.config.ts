import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  build: {
    // The two >500 kB chunks (tree-shaken ECharts, the lens dataset) are expected and lazy/shared;
    // raise the warning threshold so real regressions aren't buried in known noise.
    chunkSizeWarningLimit: 600,
  },
});
