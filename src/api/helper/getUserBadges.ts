import { ChatUserstate } from 'tmi.js';
import { IBadge } from '../types/IBadge';

export const getUserBadges = async (user: ChatUserstate): Promise<IBadge[]> => {
  const globalBadgeUrl = 'https://badges.twitch.tv/v1/badges/global/display';
  const channelBadgeUrl = `https://badges.twitch.tv/v1/badges/channels/${user['room-id']}/display?language=en`;
  const channelBadgeList = await fetch(channelBadgeUrl).then((res) => res.json());
  const badgeList = await fetch(globalBadgeUrl).then((res) => res.json());
  const badges: { badge: string; key: string }[] = [];

  if (user.badges) {
    Object.keys(user.badges).forEach((item) => {
      Object.keys(badgeList.badge_sets).forEach((badge) => {
        if (badge === item) {
          const badgeImageUrl = badgeList.badge_sets[badge].versions['1']?.image_url_1x;
          if (badgeImageUrl) {
            badges.push({
              badge: badgeImageUrl,
              key: Math.random().toString(36).substring(7),
            });
          }
        }
      });
      Object.keys(channelBadgeList.badge_sets).forEach((badge) => {
        if (badge === item) {
          const badgeImageUrl =
            channelBadgeList.badge_sets[badge].versions[user.badges?.[item]]?.image_url_1x;

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
};
