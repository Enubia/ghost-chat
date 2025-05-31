/**
 * @param {string} string
 * @returns string | undefined
 */
function formatMessage(string) {
    if (!string) {
        console.error('No string provided');
        return;
    }

    if (!string.includes(':')) {
        return `<span class="text-gray-400 bg-gray-900 px-1">misc</span>: ${string}`;
    }

    const [commitType, rest] = string.split(':').map((part) => part.trim());

    switch (commitType) {
        case 'new':
        case 'feat':
            return `<span class="text-green-400 bg-green-900 px-1">${commitType}</span>: ${rest}`;
        case 'refactor':
        case 'deps':
            return `<span class="text-purple-400 bg-purple-900 px-1">${commitType}</span>: ${rest}`;
        case 'docs':
            return `<span class="text-blue-400 bg-blue-900 px-1">${commitType}</span>: ${rest}`;
        case 'update':
            return `<span class="text-pink-400 bg-pink-900 px-1">${commitType}</span>: ${rest}`;
        case 'chore':
            return `<span class="text-blue-400 bg-blue-900 px-1">${commitType}</span>: ${rest}`;
        case 'fix':
            return `<span class="text-yellow-400 bg-yellow-900 px-1">${commitType}</span>: ${rest}`;
        case 'ci':
            return `<span class="text-gray-400 bg-gray-900 px-1">${commitType}</span>: ${rest}`;
        default:
            break;
    }

    return string;
}

module.exports = function (Handlebars) {
    Handlebars.registerHelper('format', formatMessage);
};
