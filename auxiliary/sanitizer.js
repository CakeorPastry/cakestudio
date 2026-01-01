const unidecode = require('unidecode');

function sanitize(text, defaultText, limit) {
    // Ensure input is a string to avoid errors
    if (typeof text !== 'string') text = '';

    const originalText = text;
    const defaultLimit = 29;

    // Step 1: Normalize Unicode string to 'NFKC' form
    // This converts characters like 'é' to a standard composed form
    text = text.normalize('NFKC');

    // Step 2: Remove combining diacritical marks (accents)
    // These are Unicode characters that combine with letters (e.g. acute accent)
    text = text.replace(/[\u0300-\u036f]/g, '');

    // Step 3: Remove a broad range of Unicode symbols and characters
    // This removes emojis, CJK characters, punctuation, private-use chars, and specials
    // WARNING: This may be too aggressive depending on your needs!
    text = text.replace(/[\u2000-\u2BFF\u3000-\uD7FF\uE000-\uF8FF\uFFF0-\uFFFF]/g, '');

    // Step 4: Transliterate Unicode to ASCII using unidecode
    // Converts e.g. 'ß' to 'ss', 'ç' to 'c', etc.
    text = unidecode(text);

    // Step 5: Replace multiple whitespace (spaces, tabs, newlines) with a single space
    // Cleans up spacing inside the text
    text = text.replace(/\s+/g, ' ');

    // Step 6: Remove any character that is not a letter, number, or space
    // Removes punctuation, symbols, etc.
    text = text.replace(/[^A-Za-z0-9 ]/g, '');

    // Step 7: Trim leading and trailing whitespace
    text = text.trim();

    // If after sanitizing the text is empty, use the default fallback text
    if (text === '') {
        text = defaultText || 'Empty Name';
    }

    // Step 8: Limit the length of the string
    // Ensure limit is a positive number, else default to 29
    const maxLimit = typeof limit === 'number' && limit > 0 ? limit : defaultLimit;

    // Truncate and add ellipsis if over limit
    if (text.length > maxLimit) {
        text = text.slice(0, maxLimit) + '...';
    }

    // Log the original and sanitized strings for debugging
    console.log(`Original: "${originalText}"`);
    console.log(`Sanitized: "${text}"`);

    return text;
}

module.exports = sanitize;
