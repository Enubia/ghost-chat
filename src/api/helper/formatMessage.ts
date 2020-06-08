import escapeStringRegexp from 'escape-string-regexp';

export const formatMessage = async (
  message: string,
  emotes: { [p: string]: string[] } | undefined,
): Promise<string> => {
  const img =
    '<img alt="emote" class="emotes align-middle" src="https://static-cdn.jtvnw.net/emoticons/v1/item/2.0" />';
  const result = {};

  if (emotes) {
    // go through each emote
    Object.keys(emotes).forEach((key) => {
      // same emotes are stored in on key
      Object.keys(emotes[key]).forEach((range) => {
        // grab the emote range and split it to two keys
        const splittedEmotePosition = emotes[key][range].split('-');

        const substringFrom = parseInt(splittedEmotePosition[0], 10);
        let substringTo: number;

        // check if emote is in first place of the message
        if (parseInt(splittedEmotePosition[0], 10) === 0) {
          substringTo = parseInt(splittedEmotePosition[1], 10);
        } else {
          substringTo =
            parseInt(splittedEmotePosition[1], 10) - parseInt(splittedEmotePosition[0], 10);
        }

        const subString = message.substr(substringFrom, substringTo + 1);

        Object.assign(result, {
          [subString]: img.replace('item', key),
        });
      });
    });

    // go through the result, escape the keys e.g. :) -> \:\), and replace the keys with the image link
    Object.keys(result).forEach((key) => {
      const escaped = escapeStringRegexp(key);
      message = message.replace(new RegExp(escaped, 'g'), result[key]);
    });
  }

  return message;
};
