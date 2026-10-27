import { Db, ObjectId } from 'mongodb';
import { Account } from '../../domain/authorization';
import { LoadAccountByEmailRepository } from '../../data/protocols/loadAccountByEmailRepository';
import { UpdateAccessTokenRepository } from '../../data/protocols/updateAccessTokenRepository';

export interface MongoAccountDocument {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  accessToken?: string;
}

export interface AccountCollection {
  findOne(filter: { email: string }): Promise<MongoAccountDocument | null>;
  updateOne(
    filter: { _id: ObjectId },
    update: { $set: { accessToken: string } }
  ): Promise<{ matchedCount: number }>;
}

export default class AccountRepository
  implements LoadAccountByEmailRepository, UpdateAccessTokenRepository
{
  constructor(private readonly accounts: AccountCollection) {}

  async loadByEmail(email: string): Promise<Account | null> {
    const account = await this.accounts.findOne({ email });
    if (!account) {
      return null;
    }

    return {
      id: account._id.toHexString(),
      name: account.name,
      passwordHash: account.passwordHash,
    };
  }

  async updateAccessToken(
    accountId: string,
    accessToken: string
  ): Promise<void> {
    const result = await this.accounts.updateOne(
      { _id: new ObjectId(accountId) },
      { $set: { accessToken } }
    );

    if (result.matchedCount !== 1) {
      throw new Error(
        `Account ${accountId} was not found while updating token`
      );
    }
  }
}

export const createMongoAccountRepository = (
  database: Db,
  collectionName = 'accounts'
): AccountRepository =>
  new AccountRepository(
    database.collection<MongoAccountDocument>(collectionName)
  );
