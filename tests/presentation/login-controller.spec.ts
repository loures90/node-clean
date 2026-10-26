import { jest } from '@jest/globals';
import Authorization from '../../src/domain/authorization';
import LoginController from '../../src/presentation/login-controller';
import { EmailValidator } from '../../src/presentation/protocols/email-validator';

const makeSut = ({
  emailIsValid = true,
  emailValidatorThrows = false,
  authorizationThrows = false,
}: {
  emailIsValid?: boolean;
  emailValidatorThrows?: boolean;
  authorizationThrows?: boolean;
} = {}) => {
  const emailValidator: EmailValidator = {
    isValid: jest.fn((_email: string) => {
      if (emailValidatorThrows) {
        throw new Error('email validator failed');
      }
      return emailIsValid;
    }),
  };
  const authorization: Authorization = {
    auth: jest.fn(async (_credentials) => {
      if (authorizationThrows) {
        throw new Error('authorization failed');
      }
      return { accessToken: 'generated-token', name: 'User Name' };
    }),
  };
  const sut = new LoginController(emailValidator, authorization);

  return { sut, emailValidator, authorization };
};

describe('LoginController', () => {
  test('returns 400 when email is missing', async () => {
    const { sut, authorization } = makeSut();

    const response = await sut.handle({ body: { password: 'password123' } });

    expect(response).toEqual({
      statusCode: 400,
      body: { message: 'email is required' },
    });
    expect(authorization.auth).not.toHaveBeenCalled();
  });

  test('returns 400 when password is missing', async () => {
    const { sut, authorization } = makeSut();

    const response = await sut.handle({ body: { email: 'user@example.com' } });

    expect(response).toEqual({
      statusCode: 400,
      body: { message: 'password is required' },
    });
    expect(authorization.auth).not.toHaveBeenCalled();
  });

  test('returns 400 when email is invalid', async () => {
    const { sut, emailValidator, authorization } = makeSut({
      emailIsValid: false,
    });

    const response = await sut.handle({
      body: { email: 'invalid-email', password: 'password123' },
    });

    expect(emailValidator.isValid).toHaveBeenCalledWith('invalid-email');
    expect(response).toEqual({
      statusCode: 400,
      body: { message: 'email is invalid' },
    });
    expect(authorization.auth).not.toHaveBeenCalled();
  });

  test('validates the email and calls authorization with email and password', async () => {
    const { sut, emailValidator, authorization } = makeSut();

    const response = await sut.handle({
      body: { email: 'user@example.com', password: 'password123' },
    });

    expect(emailValidator.isValid).toHaveBeenCalledWith('user@example.com');
    expect(authorization.auth).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(response).toEqual({
      statusCode: 200,
      body: { accessToken: 'generated-token', name: 'User Name' },
    });
  });

  test('returns 500 when the email validator throws', async () => {
    const { sut, authorization } = makeSut({ emailValidatorThrows: true });

    const response = await sut.handle({
      body: { email: 'user@example.com', password: 'password123' },
    });

    expect(response).toEqual({
      statusCode: 500,
      body: { message: 'Internal server error' },
    });
    expect(authorization.auth).not.toHaveBeenCalled();
  });

  test('returns 500 when authorization throws an infrastructure error', async () => {
    const { sut } = makeSut({ authorizationThrows: true });

    const response = await sut.handle({
      body: { email: 'user@example.com', password: 'password123' },
    });

    expect(response).toEqual({
      statusCode: 500,
      body: { message: 'Internal server error' },
    });
  });
});
