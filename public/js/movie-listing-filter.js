/**
 * Client-side filter for the /filme-fuer-softwareentwickler/ index page.
 * Two AND-combined filters:
 *   - Category (data-category attribute on each .movie section)
 *   - Type     (data-type attribute on each .movie section)
 *
 * Mirrors the structure of /js/podcast-listing-filter.js so future tweaks can
 * be applied to both with minimal context-switching.
 */

function addFilterListener() {
	document.getElementById('filter-category').addEventListener('change', filter);
	document.getElementById('filter-type').addEventListener('change', filter);
}

function getFilterAttributes() {
	const f = {};
	const c = document.getElementById('filter-category').value;
	const t = document.getElementById('filter-type').value;
	if (c) f.category = c;
	if (t) f.type = t;
	return f;
}

function makeEveryMovieVisible() {
	const elems = document.getElementsByClassName('movie');
	for (const el of elems) {
		el.classList.remove('hidden');
	}
}

function filter() {
	const f = getFilterAttributes();
	if (Object.keys(f).length === 0) {
		makeEveryMovieVisible();
		toggleNoFilterMatchMessage();
		hideFilterCountMessage();
		return;
	}

	const elems = document.getElementsByClassName('movie');
	for (const el of elems) {
		let visible = true;
		if (f.category && el.dataset.category !== f.category) visible = false;
		if (f.type && el.dataset.type !== f.type) visible = false;
		el.classList.toggle('hidden', !visible);
	}

	toggleNoFilterMatchMessage();
	updateFilterCounter();
	showFilterCountMessage();
}

function updateFilterCounter() {
	document.getElementById('filter-count-match').innerText = currentVisibleMovieCounter();
	document.getElementById('filter-count-total').innerText = getTotalMovieCounter();
}

function toggleNoFilterMatchMessage() {
	const counter = currentVisibleMovieCounter();
	const noMatch = document.getElementById('no-filter-match');
	if (counter === 0) {
		noMatch.classList.remove('hidden');
	} else {
		noMatch.classList.add('hidden');
	}
}

function showFilterCountMessage() {
	document.getElementById('filter-count').classList.remove('invisible');
}

function hideFilterCountMessage() {
	document.getElementById('filter-count').classList.add('invisible');
}

function currentVisibleMovieCounter() {
	const elems = document.getElementsByClassName('movie');
	let counter = elems.length;
	for (const el of elems) {
		if (el.classList.contains('hidden')) counter -= 1;
	}
	return counter;
}

function getTotalMovieCounter() {
	return document.getElementsByClassName('movie').length;
}

window.addEventListener('DOMContentLoaded', () => {
	// Reveal the filter bar only when JS is enabled — without JS the static
	// listing already shows everything, so dropdowns would just be dead UI.
	document.getElementById('filter').classList.remove('invisible');

	addFilterListener();
	updateFilterCounter();
});
