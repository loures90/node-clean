import { ObjectId } from 'mongodb';
import AccountRepository, {
  AccountCollection,
  MongoAccountDocument,
} from '../src/infra/db/account-repository';

describe('AccountRepository', () => {
  const makeAccountDocument = (): MongoAccountDocument => ({
    _id: new ObjectId('64b000000000000000000001'),
    email: 'user@example.com',
    name: 'User Name',
    passwordHash: 'hashed-password',
  });

  test('loads an account by email and maps the MongoDB id', async () => {
    const accountDocument = makeAccountDocument();
    const collection: AccountCollection = {
      findOne: jest.fn(async (_filter) => accountDocument),
      updateOne: jest.fn(async () => ({ matchedCount: 1 })),
    };
    const repository = new AccountRepository(collection);

    const result = await repository.loadByEmail('user@example.com');

    expect(collection.findOne).toHaveBeenCalledWith({
      email: 'user@example.com',
    });
    expect(result).toEqual({
      id: '64b000000000000000000001',
      name: 'User Name',
      passwordHash: 'hashed-password',
    });
  });

  test('returns null when no account matches the email', async () => {
    const collection: AccountCollection = {
      findOne: jest.fn(async (_filter) => null),
      updateOne: jest.fn(async () => ({ matchedCount: 0 })),
    };
    const repository = new AccountRepository(collection);

    const result = await repository.loadByEmail('unknown@example.com');

    expect(result).toBeNull();
  });

  test('updates access token for the account id', async () => {
    const collection: AccountCollection = {
      findOne: jest.fn(async (_filter) => null),
      updateOne: jest.fn(async () => ({ matchedCount: 1 })),
    };
    const repository = new AccountRepository(collection);

    await repository.updateAccessToken(
      '64b000000000000000000001',
      'generated-token'
    );

    expect(collection.updateOne).toHaveBeenCalledWith(
      { _id: new ObjectId('64b000000000000000000001') },
      { $set: { accessToken: 'generated-token' } }
    );
  });

  test('throws if the account is not found when updating its access token', async () => {
    const collection: AccountCollection = {
      findOne: jest.fn(async (_filter) => null),
      updateOne: jest.fn(async () => ({ matchedCount: 0 })),
    };
    const repository = new AccountRepository(collection);

    await expect(
      repository.updateAccessToken(
        '64b000000000000000000001',
        'generated-token'
      )
    ).rejects.toThrow('was not found while updating token');
  });
});
