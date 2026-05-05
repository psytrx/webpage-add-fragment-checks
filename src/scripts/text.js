/**
 * Truncates a string at `maxLen` characters without splitting a word.
 *
 * If the cut-off lands inside a word, the function advances to the next word
 * boundary (whitespace) or sentence terminator (. ! ?), whichever comes first.
 * Sentence terminators are kept in the output; trailing whitespace is trimmed.
 * The string " ..." is appended when truncation occurred.
 *
 * @param {string} text - The text to truncate
 * @param {number} [maxLen=600] - The character index where truncation should start
 * @returns {string}
 */
export function truncateDescription(text, maxLen = 600) {
	if (!text || text.length <= maxLen) return text;

	// If the cut-off is already at a boundary, just trim and tack on the ellipsis.
	const charAt = text[maxLen];
	if (/[\s.!?]/.test(charAt)) {
		return text.slice(0, maxLen).trimEnd() + ' ...';
	}

	// Otherwise scan forward for the next boundary. The first hit wins.
	const tailMatch = text.slice(maxLen).match(/[\s.!?]/);
	if (!tailMatch) {
		// No further boundary — fall back to a hard cut.
		return text.slice(0, maxLen).trimEnd() + ' ...';
	}

	const boundary = tailMatch[0];
	const cutEnd = maxLen + tailMatch.index + (/[.!?]/.test(boundary) ? 1 : 0);
	return text.slice(0, cutEnd).trimEnd() + ' ...';
}

/**
 * Splits a string into a sequence of plain-text and URL segments so callers
 * can render the URLs as anchors while keeping the surrounding text intact.
 *
 * Each returned segment is one of:
 *   { kind: 'text', value: string }
 *   { kind: 'link', value: string, href: string }
 *
 * Trailing punctuation (`.`, `,`, `;`, `:`, `!`, `?`, `)`, `]`) on a URL is
 * pushed back into the next text segment — that way "...visit https://example.com."
 * doesn't end up linking the period.
 *
 * @param {string} text
 * @returns {Array<{kind:'text'|'link', value:string, href?:string}>}
 */
export function linkify(text) {
	if (!text) return [{ kind: 'text', value: '' }];

	const parts = [];
	const re = /https?:\/\/[^\s<>"']+/g;
	let last = 0;
	let m;
	while ((m = re.exec(text)) !== null) {
		let url = m[0];
		let trailing = '';
		while (/[.,;:!?)\]]$/.test(url)) {
			trailing = url.slice(-1) + trailing;
			url = url.slice(0, -1);
		}
		// If stripping trailing punctuation left an empty URL, fall through and
		// emit the original match as plain text — there was nothing to link.
		if (!url) {
			if (m.index > last) parts.push({ kind: 'text', value: text.slice(last, m.index) });
			parts.push({ kind: 'text', value: m[0] });
			last = m.index + m[0].length;
			continue;
		}
		if (m.index > last) parts.push({ kind: 'text', value: text.slice(last, m.index) });
		parts.push({ kind: 'link', value: url, href: url });
		if (trailing) parts.push({ kind: 'text', value: trailing });
		last = m.index + m[0].length;
	}
	if (last < text.length) parts.push({ kind: 'text', value: text.slice(last) });
	return parts;
}
