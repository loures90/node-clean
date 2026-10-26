import { jest } from '@jest/globals';
import DbAuthorization from '../../src/data/authorization';
import { HashComparer } from '../../src/data/hashComparer';
import { LoadAccountByEmailRepository } from '../../src/data/loadAccountByEmailRepository';
import { TokenGenerator } from '../../src/data/tokenGenerator';
import { UpdateAccessTokenRepository } from '../../src/data/updateAccessTokenRepository';
import { Account } from '../../src/domain/authorization';

const account: Account = {
  id: 'account-id',
  name: 'User Name',
  passwordHash: 'hashed-password',
};

const makeSut = ({
  accountToLoad = account,
  passwordIsValid = true,
  failureAt,
}: {
  accountToLoad?: Account | null;
  passwordIsValid?: boolean;
  failureAt?:
    'loadAccount' | 'comparePassword' | 'generateToken' | 'updateToken';
} = {}) => {
  const loadAccountByEmailRepository: LoadAccountByEmailRepository = {
    loadByEmail: jest.fn(async (_email: string) => {
      if (failureAt === 'loadAccount') {
        throw new Error('database lookup failed');
      }
      return accountToLoad;
    }),
  };
  const hashComparer: HashComparer = {
    compare: jest.fn(async (_password: string, _hashedPassword: string) => {
      if (failureAt === 'comparePassword') {
        throw new Error('password comparison failed');
      }
      return passwordIsValid;
    }),
  };
  const tokenGenerator: TokenGenerator = {
    generate: jest.fn(async (_accountId: string) => {
      if (failureAt === 'generateToken') {
        throw new Error('token generation failed');
      }
      return 'generated-token';
    }),
  };
  const updateAccessTokenRepository: UpdateAccessTokenRepository = {
    updateAccessToken: jest.fn(
      async (_accountId: string, _accessToken: string) => {
        if (failureAt === 'updateToken') {
          throw new Error('token update failed');
        }
      }
    ),
  };
  const sut = new DbAuthorization(
    loadAccountByEmailRepository,
    hashComparer,
    tokenGenerator,
    updateAccessTokenRepository
  );

  return {
    sut,
    loadAccountByEmailRepository,
    hashComparer,
    tokenGenerator,
    updateAccessTokenRepository,
  };
};

describe('DbAuthorization', () => {
  test('should call LoadAccountByEmailRepository with the provided email', async () => {
    const { sut, loadAccountByEmailRepository } = makeSut();

    await sut.auth({ email: 'user@example.com', password: 'password123' });

    expect(loadAccountByEmailRepository.loadByEmail).toHaveBeenCalledWith(
      'user@example.com'
    );
  });

  test('should return error 401 if the account is not found', async () => {
    const { sut, hashComparer } = makeSut({ accountToLoad: null });

    const result = await sut.auth({
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
    const { sut, hashComparer } = makeSut();

    await sut.auth({ email: 'user@example.com', password: 'client-password' });

    expect(hashComparer.compare).toHaveBeenCalledWith(
      'client-password',
      'hashed-password'
    );
  });

  test('should return error 401 if the password does not match the stored hash', async () => {
    const { sut } = makeSut({ passwordIsValid: false });

    const result = await sut.auth({
      email: 'user@example.com',
      password: 'wrong-password',
    });

    expect(result).toEqual({
      status: 401,
      message: 'Invalid credentials',
    });
  });

  test('should call TokenGenerator with the account id', async () => {
    const { sut, tokenGenerator } = makeSut();

    await sut.auth({ email: 'user@example.com', password: 'password123' });

    expect(tokenGenerator.generate).toHaveBeenCalledWith('account-id');
  });

  test('should return the access token and user name on successful authorization', async () => {
    const { sut } = makeSut();

    const result = await sut.auth({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(result).toEqual({
      accessToken: 'generated-token',
      name: 'User Name',
    });
  });

  test('should update the stored access token with the account id and generated token', async () => {
    const { sut, updateAccessTokenRepository } = makeSut();

    await sut.auth({ email: 'user@example.com', password: 'password123' });

    expect(updateAccessTokenRepository.updateAccessToken).toHaveBeenCalledWith(
      'account-id',
      'generated-token'
    );
  });

  test.each([
    ['database lookup', 'loadAccount'],
    ['password comparison', 'comparePassword'],
    ['token generation', 'generateToken'],
    ['access token update', 'updateToken'],
  ] as const)(
    'propagates errors from the %s dependency',
    async (_description, failureAt) => {
      const { sut } = makeSut({ failureAt });

      await expect(
        sut.auth({ email: 'user@example.com', password: 'password123' })
      ).rejects.toThrow();
    }
  );
});
