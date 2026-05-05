import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { buildLastmodMap, pathFromSitemapUrl } from './scripts/sitemap-lastmod.mjs';

// do not add to sitemap if specified string is contained in path
const exludeFromSitemap = ['meetup/alps/promote/', 'meetup/rhine-ruhr/promote/', 'linktree/'];

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
			filter: (page) => !exludeFromSitemap.some((path) => page.includes(path)),
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
