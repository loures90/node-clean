import { Account } from '../../domain/authorization';
import { LoadAccountByEmailRepository } from '../../data/loadAccountByEmailRepository';
import { UpdateAccessTokenRepository } from '../../data/updateAccessTokenRepository';

export interface MockAccount extends Account {
  email: string;
  accessToken?: string;
}

export default class AccountRepository
  implements LoadAccountByEmailRepository, UpdateAccessTokenRepository
{
  constructor(
    private readonly accounts: MockAccount[] = [
      {
        id: 'account-id',
        email: 'user@example.com',
        name: 'User Name',
        passwordHash: 'hashed-password',
      },
    ]
  ) {}

  async loadByEmail(email: string): Promise<Account | null> {
    const account = this.accounts.find(
      (storedAccount) => storedAccount.email === email
    );
    if (!account) {
      return null;
    }

    return {
      id: account.id,
      name: account.name,
      passwordHash: account.passwordHash,
    };
  }

  async updateAccessToken(
    accountId: string,
    accessToken: string
  ): Promise<void> {
    const account = this.accounts.find(
      (storedAccount) => storedAccount.id === accountId
    );
    if (account) {
      account.accessToken = accessToken;
    }
  }
}
