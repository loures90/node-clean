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
});
