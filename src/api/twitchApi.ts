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
    this.client = client({
      connection: {
        reconnect: true,
      },
      ...options,
    });
    this.client.connect().catch((err) => {
      throw new Error(`Failed to connect to channel ${this.options.channels}: ${err}`);
    });
    this.messages = [];
  }

  public async initChat(): Promise<void> {
    this.client.on('message', (_channel, userstate, message, _self) => {
      console.log(_channel);
      console.log(userstate);
      console.log(message);
      console.log(_self);
      this.messages.push({
        user: {
          color: userstate.color,
          name: userstate.username,
        },
        message,
        key: Math.random().toString(36).substring(7),
      });
    });
  }

  public async getTwitchChat(): Promise<IMessageResponse[]> {
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
