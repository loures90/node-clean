import { compare } from 'bcryptjs';
import { HashComparer } from '../data/protocols/hashComparer';

export default class BcryptHashComparer implements HashComparer {
  compare(value: string, hash: string): Promise<boolean> {
    return compare(value, hash);
  }
}
