export const formatMessage = (
  message: string,
  emotes: { [p: string]: string[] } | undefined,
): string => {
  const img =
    '<img alt="emote" width="30px;" height="25px;" src=https://static-cdn.jtvnw.net/emoticons/v1/{item}/3.0>';
  const result = {};

  if (emotes) {
    Object.keys(emotes).forEach((key) => {
      let splitted: string[] = [];
      Object.keys(emotes[key]).forEach((range) => {
        splitted = emotes[key][range].split('-');

        result[
          message.substr(parseInt(splitted[0], 10), parseInt(splitted[1], 10) + 1)
        ] = img.replace(/{item}/, key);
      });
    });

    Object.keys(result).forEach((key) => {
      message = message.replace(new RegExp(key, 'g'), result[key]);
    });
  }

  return message;
};
