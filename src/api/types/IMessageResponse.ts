import { IBadge } from './IBadge';

export interface IMessageResponse {
  user?: {
    color?: string;
    name?: string;
    badges?: IBadge[];
  };
  message: string;
  key: string;
}
