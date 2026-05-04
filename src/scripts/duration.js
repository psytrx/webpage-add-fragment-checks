/**
 * Formats an ISO-8601 duration string into a human-readable colon-separated form.
 *
 * Examples:
 *   "PT12M49S"  -> "12:49"
 *   "PT1H2M3S"  -> "1:02:03"
 *   "PT45S"     -> "0:45"
 *
 * If the input cannot be parsed it is returned unchanged.
 *
 * @param {string} iso - An ISO-8601 duration of the form PT[H]H[M]M[S]S
 * @returns {string}
 */
export function formatISO8601Duration(iso) {
	if (!iso || typeof iso !== 'string') return iso;
	const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
	if (!match) return iso;
	const hours = parseInt(match[1] || '0', 10);
	const minutes = parseInt(match[2] || '0', 10);
	const seconds = parseInt(match[3] || '0', 10);
	const pad = (n) => String(n).padStart(2, '0');
	if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
	return `${minutes}:${pad(seconds)}`;
}
