import { Account } from '../domain/authorization';

export interface LoadAccountByEmailRepository {
  loadByEmail(email: string): Promise<Account | null>;
}
