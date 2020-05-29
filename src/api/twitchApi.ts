import { client, Client, Options } from 'tmi.js';

export interface IMessageResponse {
  user?: {
    color?: string;
    name?: string;
  };
  message: string;
  key: string;
}

export default class TwitchApi {
  private client: Client;

  private messages: IMessageResponse[];

  constructor(private options: Options) {
    this.client = client(options);
    this.client.connect().catch((err) => {
      throw new Error(`Failed to connect to channel ${this.options.channels}: ${err}`);
    });
    this.messages = [];
  }

  public async initChat(): Promise<void> {
    this.client.on('message', (_channel, _userstate, message, _self) => {
      this.messages.push({
        user: {
          color: _userstate.color,
          name: _userstate.username,
        },
        message,
        key: Math.random().toString(36).substring(7),
      });
    });
  }

  public async getTwitchChat(): Promise<IMessageResponse[] | undefined> {
    const responseMessages = this.messages;
    this.messages = [];
    return responseMessages;
  }
}
