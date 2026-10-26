import DbAuthorization from '../src/data/authorization';
import {
  Account,
  LoadAccountByEmailRepository,
} from '../src/domain/authorization';

describe('Authorization', () => {
  test('should call LoadAccountByEmailRepository with the provided email', async () => {
    const account: Account = {
      id: 'account-id',
      name: 'User Name',
      passwordHash: 'hashed-password',
    };
    const repository: LoadAccountByEmailRepository = {
      loadByEmail: jest.fn(async () => account),
    };
    const authorization = new DbAuthorization(repository);

    await authorization.auth({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(repository.loadByEmail).toHaveBeenCalledWith('user@example.com');
  });

  test('should return error 401 if the account is not found', async () => {
    const repository: LoadAccountByEmailRepository = {
      loadByEmail: jest.fn(async () => null),
    };
    const authorization = new DbAuthorization(repository);

    const result = await authorization.auth({
      email: 'missing@example.com',
      password: 'password123',
    });

    expect(result).toEqual({
      status: 401,
      message: 'Invalid credentials',
    });
  });
});
