import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { buildLastmodMap, pathFromSitemapUrl } from './scripts/sitemap-lastmod.mjs';

// Pages we deliberately keep out of the sitemap. The check is a substring
// match against the route path, so any sub-route below these prefixes is
// excluded too.
//
//   meetup/<flavor>/promote/   short-lived QR-code/campaign pages we share
//                              from the stage; they exist for a single event
//                              and should not be indexed.
//   linktree/                  link-in-bio landing that just redirects to
//                              other internal pages — no original content.
const excludeFromSitemap = ['meetup/alps/promote/', 'meetup/rhine-ruhr/promote/', 'linktree/'];

// Pre-compute lastmod for content-driven pages once per build. The serialize
// hook below runs once per URL and must stay synchronous, so the heavy
// filesystem work happens up front.
const SITE = 'https://engineeringkiosk.dev/';
const lastmodMap = buildLastmodMap();

// https://astro.build/config
export default defineConfig({
	output: 'static',
	site: SITE,
	trailingSlash: 'always',

	integrations: [
		sitemap({
			filter: (page) => !excludeFromSitemap.some((path) => page.includes(path)),
			serialize: (item) => {
				const lastmod = lastmodMap.get(pathFromSitemapUrl(SITE, item));
				if (lastmod) item.lastmod = lastmod;
				return item;
			},
		}),
		mdx(),
	],

	vite: {
		plugins: [tailwindcss()],
	},
});
