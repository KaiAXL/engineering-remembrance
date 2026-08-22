// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static site generation (default). Builds to ./dist as plain HTML/CSS/JS,
// deployable to GitHub Pages / Cloudflare Pages. Custom domain lives at the
// root, so no `base` path is needed.
export default defineConfig({
  site: 'https://engineeringremembrance.org',
  // Emit /case.html rather than /case/index.html, preserving the site's existing
  // .html URL scheme that the navigation and cross-links (and any external links
  // to the live site) already depend on.
  build: { format: 'file' },
  // Auto-emits sitemap-index.xml + sitemap-0.xml from `site:` at build. robots.txt
  // points crawlers at it. `serialize` rewrites each URL to the .html scheme our
  // build actually emits (format:'file'), so crawlers hit real files, not 404s.
  integrations: [
    sitemap({
      serialize(item) {
        const u = new URL(item.url);
        if (u.pathname !== '/' && !u.pathname.endsWith('.html')) {
          u.pathname += '.html';
          item.url = u.toString();
        }
        return item;
      },
    }),
  ],
});
