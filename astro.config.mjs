// @ts-check
import { defineConfig } from 'astro/config';

// Static site generation (default). Builds to ./dist as plain HTML/CSS/JS,
// deployable to GitHub Pages / Cloudflare Pages. Custom domain lives at the
// root, so no `base` path is needed.
export default defineConfig({
  site: 'https://engineeringremembrance.org',
  // Emit /case.html rather than /case/index.html, preserving the site's existing
  // .html URL scheme that the navigation and cross-links (and any external links
  // to the live site) already depend on.
  build: { format: 'file' },
});
