import AccountRepository, {
  MockAccount,
} from '../src/infra/db/account-repository';

describe('AccountRepository', () => {
  const makeAccount = (): MockAccount => ({
    id: 'account-id',
    email: 'user@example.com',
    name: 'User Name',
    passwordHash: 'hashed-password',
  });

  test('loads an account by email', async () => {
    const account = makeAccount();
    const repository = new AccountRepository([account]);

    const result = await repository.loadByEmail('user@example.com');

    expect(result).toEqual({
      id: 'account-id',
      name: 'User Name',
      passwordHash: 'hashed-password',
    });
  });

  test('returns null when no account matches the email', async () => {
    const repository = new AccountRepository([makeAccount()]);

    const result = await repository.loadByEmail('unknown@example.com');

    expect(result).toBeNull();
  });

  test('updates the access token for the matching account', async () => {
    const account = makeAccount();
    const repository = new AccountRepository([account]);

    await repository.updateAccessToken('account-id', 'generated-token');

    expect(account.accessToken).toBe('generated-token');
  });
});
