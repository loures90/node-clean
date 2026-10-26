import DbAuthorization from '../src/data/authorization';
import { HashComparer } from '../src/data/hashComparer';
import { LoadAccountByEmailRepository } from '../src/data/loadAccountByEmailRepository';
import { TokenGenerator } from '../src/data/tokenGenerator';
import { UpdateAccessTokenRepository } from '../src/data/updateAccessTokenRepository';
import { Account } from '../src/domain/authorization';

describe('Authorization', () => {
  const account: Account = {
    id: 'account-id',
    name: 'User Name',
    passwordHash: 'hashed-password',
  };

  const createTokenGenerator = (): TokenGenerator => ({
    generate: jest.fn(async () => 'generated-token'),
  });

  const createUpdateAccessTokenRepository =
    (): UpdateAccessTokenRepository => ({
      updateAccessToken: jest.fn(async () => undefined),
    });

  test('should call LoadAccountByEmailRepository with the provided email', async () => {
    const repository: LoadAccountByEmailRepository = {
      loadByEmail: jest.fn(async () => account),
    };
    const hashComparer: HashComparer = {
      compare: jest.fn(async () => true),
    };
    const authorization = new DbAuthorization(
      repository,
      hashComparer,
      createTokenGenerator(),
      createUpdateAccessTokenRepository()
    );

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
    const hashComparer: HashComparer = {
      compare: jest.fn(async () => true),
    };
    const authorization = new DbAuthorization(
      repository,
      hashComparer,
      createTokenGenerator(),
      createUpdateAccessTokenRepository()
    );

    const result = await authorization.auth({
      email: 'missing@example.com',
      password: 'password123',
    });

    expect(result).toEqual({
      status: 401,
      message: 'Invalid credentials',
    });
    expect(hashComparer.compare).not.toHaveBeenCalled();
  });

  test('should call HashComparer with the provided password and stored hash', async () => {
    const repository: LoadAccountByEmailRepository = {
      loadByEmail: jest.fn(async () => account),
    };
    const hashComparer: HashComparer = {
      compare: jest.fn(async () => true),
    };
    const authorization = new DbAuthorization(
      repository,
      hashComparer,
      createTokenGenerator(),
      createUpdateAccessTokenRepository()
    );

    await authorization.auth({
      email: 'user@example.com',
      password: 'client-password',
    });

    expect(hashComparer.compare).toHaveBeenCalledWith(
      'client-password',
      'hashed-password'
    );
  });

  test('should return error 401 if the password does not match the stored hash', async () => {
    const repository: LoadAccountByEmailRepository = {
      loadByEmail: jest.fn(async () => account),
    };
    const hashComparer: HashComparer = {
      compare: jest.fn(async () => false),
    };
    const authorization = new DbAuthorization(
      repository,
      hashComparer,
      createTokenGenerator(),
      createUpdateAccessTokenRepository()
    );

    const result = await authorization.auth({
      email: 'user@example.com',
      password: 'wrong-password',
    });

    expect(result).toEqual({
      status: 401,
      message: 'Invalid credentials',
    });
  });

  test('should call TokenGenerator with the account id', async () => {
    const repository: LoadAccountByEmailRepository = {
      loadByEmail: jest.fn(async () => account),
    };
    const hashComparer: HashComparer = {
      compare: jest.fn(async () => true),
    };
    const tokenGenerator = createTokenGenerator();
    const updateAccessTokenRepository = createUpdateAccessTokenRepository();
    const authorization = new DbAuthorization(
      repository,
      hashComparer,
      tokenGenerator,
      updateAccessTokenRepository
    );

    const result = await authorization.auth({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(tokenGenerator.generate).toHaveBeenCalledWith('account-id');
    expect(result).toEqual({
      accessToken: 'generated-token',
      name: 'User Name',
    });
  });

  test('should return the access token and user name on successful authorization', async () => {
    const repository: LoadAccountByEmailRepository = {
      loadByEmail: jest.fn(async () => account),
    };
    const hashComparer: HashComparer = {
      compare: jest.fn(async () => true),
    };
    const authorization = new DbAuthorization(
      repository,
      hashComparer,
      createTokenGenerator(),
      createUpdateAccessTokenRepository()
    );

    const result = await authorization.auth({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(result).toEqual({
      accessToken: 'generated-token',
      name: 'User Name',
    });
  });

  test('should update the stored access token with the account id and generated token', async () => {
    const repository: LoadAccountByEmailRepository = {
      loadByEmail: jest.fn(async () => account),
    };
    const hashComparer: HashComparer = {
      compare: jest.fn(async () => true),
    };
    const tokenGenerator = createTokenGenerator();
    const updateAccessTokenRepository = createUpdateAccessTokenRepository();
    const authorization = new DbAuthorization(
      repository,
      hashComparer,
      tokenGenerator,
      updateAccessTokenRepository
    );

    await authorization.auth({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(updateAccessTokenRepository.updateAccessToken).toHaveBeenCalledWith(
      'account-id',
      'generated-token'
    );
  });
});
