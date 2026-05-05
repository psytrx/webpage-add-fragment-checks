// Display labels and small helpers for the awesome-software-engineering-movies
// content collection. The upstream JSON keeps category/type/platform values in
// English; this module is the single place that converts them to the German
// strings shown in the UI and used to build URL slugs.

export const CATEGORY_LABELS = {
	'Programming Languages': 'Programmiersprachen',
	'Applications / Frameworks / Systems': 'Anwendungen / Frameworks / Systeme',
	'Culture / Society': 'Kultur / Gesellschaft',
	'Culture / People': 'Kultur / Personen',
};

export const TYPE_LABELS = {
	Documentary: 'Dokumentation',
	Movie: 'Film',
	'TV Series': 'TV-Serie',
};

export const LINK_PLATFORM_LABELS = {
	youtube: 'YouTube',
	netflix: 'Netflix',
	amazonprime: 'Amazon Prime',
	disneyplus: 'Disney+',
	bpb: 'bpb',
};

// YouTube has a brand SVG today; other platforms fall back to the generic
// website icon until brand SVGs are dropped into public/images/brands/.
const KNOWN_BRAND_ICONS = new Set(['youtube']);

export function iconFor(platform) {
	if (KNOWN_BRAND_ICONS.has(platform)) {
		return `/images/brands/${platform}.svg`;
	}
	return '/images/elements/icon-website-2.svg';
}

// Returns either the mapped value or the raw key, so unknown/new upstream
// values still render rather than disappearing silently.
export function labelFor(map, key) {
	return map[key] ?? key;
}

// Slugifies a (German) display label into a URL-safe segment:
//   "Kultur / Gesellschaft"               -> "kultur-gesellschaft"
//   "Anwendungen / Frameworks / Systeme"  -> "anwendungen-frameworks-systeme"
//   "TV-Serie"                            -> "tv-serie"
export function slugLabel(label) {
	return label
		.toLowerCase()
		.replace(/[\s/.]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

// URL slug for a category, derived from the German label.
export function categorySlug(category) {
	return slugLabel(labelFor(CATEGORY_LABELS, category));
}

// URL slug for a type, derived from the German label.
export function typeSlug(type) {
	return slugLabel(labelFor(TYPE_LABELS, type));
}

// Headline used on per-type listing pages. Each type has its own canonical
// phrasing (not a literal label substitution).
export function typeHeadline(type) {
	switch (type) {
		case 'Documentary':
			return 'Dokumentationen für Softwareentwickler:innen';
		case 'Movie':
			return 'Filme für Softwareentwickler:innen';
		case 'TV Series':
			return 'TV-Serien für Softwareentwickler:innen';
		default:
			return `${labelFor(TYPE_LABELS, type)} für Softwareentwickler:innen`;
	}
}

// Title to render on a movie card, honouring localized.de overrides with
// sensible fallbacks. Some upstream entries have an empty `title` and rely on
// `name`, so we fall through both.
export function localizedTitle(movie) {
	return movie.data.localized?.de?.title || movie.data.title || movie.data.name;
}

export function localizedDescription(movie) {
	return movie.data.localized?.de?.description || movie.data.description;
}
