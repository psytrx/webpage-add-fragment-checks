import { humanTimestampToSecondsTo } from './date.js';

/**
 * Builds JSON-LD structured data for a podcast episode page.
 *
 * @param {object} frontmatter - Episode frontmatter data
 * @param {URL|string} canonicalURL - Canonical URL of the episode page
 * @param {URL|string} siteURL - Base site URL
 * @param {object} podcastInfo - Podcast metadata from podcast-info.json
 * @param {object[]} transcriptionUtterances - Processed transcript utterances (with real speaker names)
 * @returns {object} JSON-LD object
 */
export function buildEpisodeJsonLd(frontmatter, canonicalURL, siteURL, podcastInfo, transcriptionUtterances) {
	const episode = {
		'@type': 'PodcastEpisode',
		url: canonicalURL.toString(),
		name: frontmatter.title,
		description: frontmatter.description,
		datePublished: new Date(frontmatter.pubDate).toISOString(),
		image: new URL(frontmatter.image.src, siteURL).toString(),
		inLanguage: 'de',
		associatedMedia: {
			'@type': 'AudioObject',
			contentUrl: frontmatter.audio,
			encodingFormat: 'audio/mpeg',
		},
		partOfSeries: {
			'@type': 'PodcastSeries',
			name: podcastInfo.title,
			description: podcastInfo.subtitle,
			url: siteURL.toString(),
			webFeed: podcastInfo.rssFeed,
			inLanguage: 'de',
		},
		actor: frontmatter.speaker.map((s) => ({
			'@type': 'Person',
			name: s.name,
		})),
		keywords: frontmatter.tags,
	};

	if (frontmatter.chapter && frontmatter.chapter.length > 0) {
		episode.hasPart = frontmatter.chapter.map((ch) => ({
			'@type': 'Clip',
			name: ch.title,
			startOffset: humanTimestampToSecondsTo(ch.start),
		}));
	}

	if (transcriptionUtterances && transcriptionUtterances.length > 0) {
		episode.transcript = transcriptionUtterances.map((u) => `${u.speaker}: ${u.text}`).join('\n');
	}

	const sameAs = Object.values(podcastInfo.socials || {})
		.map((s) => s.link)
		.filter(Boolean);

	return {
		'@context': 'https://schema.org',
		'@graph': [
			episode,
			{
				'@type': 'Organization',
				name: 'Engineering Kiosk',
				url: siteURL.toString(),
				sameAs: sameAs,
			},
		],
	};
}

/**
 * Builds JSON-LD structured data for a blog post page.
 *
 * @param {object} content - Blog post frontmatter data
 * @param {URL|string} canonicalURL - Canonical URL of the blog post
 * @param {URL|string} siteURL - Base site URL
 * @returns {object} JSON-LD object
 */
export function buildBlogPostJsonLd(content, canonicalURL, siteURL) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: content.title,
		description: content.description,
		datePublished: new Date(content.pubDate).toISOString(),
		image: new URL(content.thumbnail.src, siteURL).toString(),
		inLanguage: 'de',
		url: canonicalURL.toString(),
		keywords: content.tags,
		publisher: {
			'@type': 'Organization',
			name: 'Engineering Kiosk',
			url: siteURL.toString(),
		},
	};
}

/**
 * Builds JSON-LD structured data for the German tech podcasts directory page.
 *
 * @param {object[]} podcasts - Array of podcast collection entries
 * @param {URL|string} canonicalURL - Canonical URL of the directory page
 * @param {URL|string} siteURL - Base site URL
 * @returns {object} JSON-LD object
 */
export function buildPodcastDirectoryJsonLd(podcasts, canonicalURL, siteURL) {
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Deutschsprachige Tech Podcasts',
		description: 'Eine handverlesene Liste der besten deutschsprachigen Tech Podcasts zu relevanten Themen für Entwickler:innen, Tech-Leads und Nerds.',
		url: canonicalURL.toString(),
		inLanguage: 'de',
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: podcasts.length,
			itemListElement: podcasts.map((podcast, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				item: {
					'@type': 'PodcastSeries',
					name: podcast.data.name,
					description: podcast.data.description,
					url: podcast.data.website,
					image: new URL(podcast.data.image.src, siteURL).toString(),
					webFeed: podcast.data.rssFeed,
					inLanguage: 'de',
				},
			})),
		},
	};
}

/**
 * Builds JSON-LD structured data for the software engineering movies directory page.
 *
 * @param {object[]} movies - Array of movie collection entries
 * @param {URL|string} canonicalURL - Canonical URL of the directory page
 * @param {URL|string} siteURL - Base site URL
 * @returns {object} JSON-LD object
 */
export function buildMoviesDirectoryJsonLd(movies, canonicalURL, siteURL) {
	const PLATFORM_ORDER = ['youtube', 'netflix', 'amazon_prime_video', 'bpb'];

	function pickPrimaryLink(links) {
		const entries = Object.entries(links ?? {});
		if (entries.length === 0) return null;
		entries.sort(([a], [b]) => {
			const ai = PLATFORM_ORDER.indexOf(a);
			const bi = PLATFORM_ORDER.indexOf(b);
			if (ai === -1 && bi === -1) return a.localeCompare(b);
			if (ai === -1) return 1;
			if (bi === -1) return -1;
			return ai - bi;
		});
		return entries[0];
	}

	function youtubeVideoId(url) {
		if (!url) return null;
		const m = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&/]+)/);
		return m ? m[1] : null;
	}

	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Filme für Softwareentwickler:innen',
		description: 'Eine handverlesene Liste der besten Filme und Dokumentationen für Softwareentwickler:innen, Tech-Leads und Nerds.',
		url: canonicalURL.toString(),
		inLanguage: 'de',
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: movies.length,
			itemListElement: movies.map((movie, index) => {
				const primary = pickPrimaryLink({
					...movie.data.links,
					...(movie.data.localized?.de?.links ?? {}),
				});
				const item = {
					'@type': 'VideoObject',
					name: movie.data.name,
					description: movie.data.description,
					thumbnailUrl: new URL(movie.data.image.src, siteURL).toString(),
				};
				if (primary) item.contentUrl = primary[1];
				const ytUrl = movie.data.links?.youtube;
				const ytId = youtubeVideoId(ytUrl);
				if (ytId) item.embedUrl = `https://www.youtube.com/embed/${ytId}`;
				if (movie.data.duration) item.duration = movie.data.duration;
				if (movie.data.publishedAt) item.uploadDate = movie.data.publishedAt;
				if (movie.data.language) item.inLanguage = movie.data.language;
				if (movie.data.tags?.length) item.keywords = movie.data.tags;
				if (movie.data.views?.youtube) {
					item.interactionStatistic = {
						'@type': 'InteractionCounter',
						interactionType: { '@type': 'WatchAction' },
						userInteractionCount: movie.data.views.youtube,
					};
				}
				if (movie.data.channel?.title) {
					item.publisher = {
						'@type': 'Organization',
						name: movie.data.channel.title,
					};
				}
				const imdb = movie.data.ratings?.imdb;
				if (imdb) {
					item.aggregateRating = {
						'@type': 'AggregateRating',
						ratingValue: imdb.averageRating,
						ratingCount: imdb.numVotes,
						bestRating: 10,
						worstRating: 1,
					};
				}
				return {
					'@type': 'ListItem',
					position: index + 1,
					item,
				};
			}),
		},
	};
}

/**
 * Builds JSON-LD structured data for the software engineering games directory page.
 *
 * @param {object[]} games - Array of game collection entries
 * @param {URL|string} canonicalURL - Canonical URL of the directory page
 * @param {URL|string} siteURL - Base site URL
 * @returns {object} JSON-LD object
 */
export function buildGamesDirectoryJsonLd(games, canonicalURL, siteURL) {
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Spiele für Softwareentwickler:innen',
		description: 'Eine handverlesene Liste der besten Spiele für Softwareentwickler:innen, Tech-Leads und Nerds.',
		url: canonicalURL.toString(),
		inLanguage: 'de',
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: games.length,
			itemListElement: games.map((game, index) => {
				const platforms = [];
				if (game.data.platforms.windows) platforms.push('Windows');
				if (game.data.platforms.mac) platforms.push('macOS');
				if (game.data.platforms.linux) platforms.push('Linux');

				const item = {
					'@type': 'VideoGame',
					name: game.data.name,
					description: game.data.german_content.short_description,
					url: game.data.website,
					image: new URL(game.data.image.src, siteURL).toString(),
					operatingSystem: platforms,
					genre: game.data.german_content.genres,
				};

				if (game.data.steamID) {
					item.gamePlatform = 'Steam';
				}

				return {
					'@type': 'ListItem',
					position: index + 1,
					item: item,
				};
			}),
		},
	};
}
