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

/**
 * Parses an ISO-8601 duration into total {hours, minutes, seconds}.
 * Returns null if the input cannot be parsed.
 *
 * @param {string} iso
 * @returns {{hours:number, minutes:number, seconds:number}|null}
 */
function parseISO8601Duration(iso) {
	if (!iso || typeof iso !== 'string') return null;
	const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
	if (!match) return null;
	return {
		hours: parseInt(match[1] || '0', 10),
		minutes: parseInt(match[2] || '0', 10),
		seconds: parseInt(match[3] || '0', 10),
	};
}

/**
 * Renders an ISO-8601 duration as a human-readable, approximate German label.
 *
 * Rules:
 *   - shorter than a minute       -> "unter 1 Minute"
 *   - less than an hour           -> "ca. N Minute(n)" (seconds >= 30 round up)
 *   - >= 1 hour, < 5 minutes      -> "ca. N Stunde(n)" (drop residual minutes)
 *   - >= 1 hour, >= 5 minutes     -> "ca. N Stunde(n) M Minuten" (drop seconds)
 *
 * If parsing fails, the original string is returned so callers always have
 * something printable.
 *
 * @param {string} iso
 * @returns {string}
 */
export function humanizeISO8601Duration(iso) {
	const parsed = parseISO8601Duration(iso);
	if (!parsed) return iso;

	const { hours, minutes, seconds } = parsed;
	const hourWord = (n) => (n === 1 ? 'Stunde' : 'Stunden');
	const minuteWord = (n) => (n === 1 ? 'Minute' : 'Minuten');

	if (hours === 0) {
		if (minutes === 0 && seconds < 60) {
			if (seconds === 0) return iso;
			return 'unter 1 Minute';
		}
		const roundedMinutes = minutes + (seconds >= 30 ? 1 : 0);
		if (roundedMinutes === 0) return 'unter 1 Minute';
		return `ca. ${roundedMinutes} ${minuteWord(roundedMinutes)}`;
	}

	if (minutes < 5) {
		return `ca. ${hours} ${hourWord(hours)}`;
	}
	return `ca. ${hours} ${hourWord(hours)} ${minutes} ${minuteWord(minutes)}`;
}
