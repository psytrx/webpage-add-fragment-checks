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
