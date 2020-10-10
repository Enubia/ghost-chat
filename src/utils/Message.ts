import escapeStringRegexp from 'escape-string-regexp';
import { ChatUserstate } from 'tmi.js';
import { IBadge } from '@/renderer/types/IBadge';

export default class Message {
  private channelBadgeList: any;

  private badgeList: any;

  constructor() {
    this.channelBadgeList = [];
    this.badgeList = [];
  }

  private async fetchFFZEmotes(): Promise<void> {
    // TODO: emote list to long, think about how to pre fetch the data
  }

  private async fetchBTTVEmotes(): Promise<void> {
    // TODO: check if we can somehow use their api, no official documentation for it sadly
  }

  public async formatMessage(
    message: string,
    emotes: { [p: string]: string[] } | undefined,
  ): Promise<string> {
    return new Promise((resolve) => {
      const img =
        '<img alt="emote" class="emotes align-middle" src="https://static-cdn.jtvnw.net/emoticons/v1/item/2.0" />';
      const result = {};

      if (emotes) {
        // go through each emote
        Object.keys(emotes).forEach((key) => {
          // same emotes are stored in on key
          Object.keys(emotes[key]).forEach((range) => {
            // grab the emote range and split it to two keys
            const emoteCoordinates = emotes[key][range].split('-');

            const substringFrom = parseInt(emoteCoordinates[0], 10);
            let substringTo: number;

            // check if emote is in first place of the message
            if (parseInt(emoteCoordinates[0], 10) === 0) {
              substringTo = parseInt(emoteCoordinates[1], 10);
            } else {
              substringTo = parseInt(emoteCoordinates[1], 10) - parseInt(emoteCoordinates[0], 10);
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

      resolve(message);
    });
  }

  public async getUserBadges(user: ChatUserstate): Promise<IBadge[]> {
    const globalBadgeUrl = 'https://badges.twitch.tv/v1/badges/global/display';
    const channelBadgeUrl = `https://badges.twitch.tv/v1/badges/channels/${user['room-id']}/display?language=en`;
    const badges: { badge: string; key: string }[] = [];

    // cache both badge lists so that we don't need to query it every time we need to parse badges
    if (this.channelBadgeList.length === 0) {
      this.channelBadgeList = await fetch(channelBadgeUrl).then((res) => res.json());
    }

    if (this.badgeList.length === 0) {
      this.badgeList = await fetch(globalBadgeUrl).then((res) => res.json());
    }

    if (user.badges) {
      Object.keys(user.badges).forEach((item) => {
        Object.keys(this.badgeList.badge_sets).forEach((badge) => {
          if (badge === item) {
            const badgeImageUrl = this.badgeList.badge_sets[badge].versions['1']?.image_url_1x;
            if (badgeImageUrl) {
              badges.push({
                badge: badgeImageUrl,
                key: Math.random().toString(36).substring(7),
              });
            }
          }
        });
        Object.keys(this.channelBadgeList.badge_sets).forEach((badge) => {
          if (badge === item) {
            const badgeImageUrl = this.channelBadgeList.badge_sets[badge].versions[
              user.badges?.[item]
            ]?.image_url_1x;

            if (badgeImageUrl) {
              badges.push({
                badge: badgeImageUrl,
                key: Math.random().toString(36).substring(7),
              });
            }
          }
        });
      });
    }

    return badges;
  }
}
