// @ts-check
import { defineConfig } from 'astro/config';

// Static site generation (default). Builds to ./dist as plain HTML/CSS/JS,
// deployable to GitHub Pages / Cloudflare Pages. Custom domain lives at the
// root, so no `base` path is needed.
export default defineConfig({
  site: 'https://engineeringremembrance.org',
});
