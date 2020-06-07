import { client, Client, Options } from 'tmi.js';
import { getUserBadges } from './helper/getUserBadges';
import { IBadge } from './types/IBadge';
import { IMessageResponse } from './types/IMessageResponse';
// import { formatMessage } from './helper/formatMessage';

export default class TwitchApi {
  private client: Client;

  private messages: IMessageResponse[];

  constructor(private options: Options) {
    this.client = client({
      connection: {
        reconnect: true,
      },
      ...options,
    });
    this.messages = [];
  }

  public async connect() {
    this.client.connect().catch((err) => {
      throw new Error(`Failed to connect to channel ${this.options.channels}: ${err}`);
    });
  }

  public async initChat(): Promise<void> {
    this.client.on('message', async (_channel, userstate, message, _self) => {
      let badges: IBadge[] = [];

      if (userstate.badges !== null) {
        badges = await getUserBadges(userstate);
      }

      // not working properly right now
      // if (userstate.emotes !== null) {
      //   message = formatMessage(message, userstate.emotes);
      // }

      this.messages.push({
        user: {
          color: userstate.color,
          name: userstate.username,
          badges,
        },
        message,
        key: Math.random().toString(36).substring(7),
      });
    });
  }

  public getTwitchChat(): IMessageResponse[] {
    const responseMessages = this.messages;
    this.messages = [];
    return responseMessages;
  }

  public async disconnect(): Promise<void> {
    await this.client.disconnect().catch((error) => {
      throw new Error(`Failed to disconnect from chat: ${error}`);
    });
  }
}
