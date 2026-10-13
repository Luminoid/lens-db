import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter({
        pages: 'build',
        assets: 'build',
        fallback: '404.html',
        // No precompress: Cloudflare Pages compresses at the edge and ignores .br/.gz sidecars,
        // which would only bloat the deployment file count.
        precompress: false,
        strict: true,
      }),
      // Public origin baked into prerendered absolute URLs (canonical, hreflang, sitemap).
      paths: {
        origin: 'https://lens.luminoid.dev',
      },
      prerender: {
        entries: ['*'],
      },
      // The site is fully prerendered, so CSP is delivered as a <meta> tag with build-time hashes
      // (hash mode). This keeps script-src at 'self' plus the hash of SvelteKit's one inline bootstrap,
      // with no 'unsafe-inline' for scripts. frame-ancestors cannot be set via meta, so X-Frame-Options
      // in static/_headers covers framing. style-src keeps 'unsafe-inline' for ECharts' inline style
      // attributes (it styles SVG / DOM nodes directly). The extra script-src hash below allows the
      // inline theme-boot script in src/app.html — recompute it whenever that script changes:
      //   python3 -c "import hashlib,base64,re;print('sha256-'+base64.b64encode(hashlib.sha256(re.search(r'<script>(.*?)</script>',open('src/app.html').read(),re.S).group(1).encode()).digest()).decode())"
      csp: {
        mode: 'hash',
        directives: {
          'default-src': ['self'],
          'script-src': ['self', 'sha256-gSl9/jXRnhNI6sTdda5S0E6xaWR1S/d+fB1u1HxmW+o='],
          'style-src': ['self', 'unsafe-inline'],
          'img-src': ['self', 'data:'],
          'font-src': ['self'],
          'connect-src': ['self'],
          'object-src': ['none'],
          'base-uri': ['self'],
          'form-action': ['self'],
          'upgrade-insecure-requests': true,
        },
      },
    }),
  ],
  build: {
    // The two >500 kB chunks (tree-shaken ECharts, the lens dataset) are expected and lazy/shared;
    // raise the warning threshold so real regressions aren't buried in known noise.
    chunkSizeWarningLimit: 600,
  },
});
