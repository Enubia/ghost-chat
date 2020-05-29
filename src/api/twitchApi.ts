import { client, Client, Options } from 'tmi.js';

export interface IMessageResponse {
  user?: string;
  message: string;
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
    this.messages = [];
    this.client.on('message', (_channel, _userstate, message, _self) => {
      if (!this.messages.includes({ user: _userstate.username, message })) {
        this.messages.push({ user: _userstate.username, message });
      }
    });
  }

  public async getTwitchChat(): Promise<IMessageResponse[]> {
    return this.messages;
  }
}
