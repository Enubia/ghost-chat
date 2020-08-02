import { IBadge } from './IBadge';

export interface IMessageResponse {
  user?: {
    color?: string;
    name?: string;
    badges?: IBadge[];
  };
  created: Date;
  message: string;
  key: string;
}
