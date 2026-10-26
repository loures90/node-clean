import { jwtVerify } from 'jose';
import JoseTokenGenerator from '../../src/infra/token-generator';

const secret = 'test-secret-with-at-least-32-bytes-long';

describe('JoseTokenGenerator', () => {
  test('generates an HS256 token with the account id as subject and an expiration', async () => {
    const sut = new JoseTokenGenerator(secret);

    const token = await sut.generate('account-id');
    const { payload, protectedHeader } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    expect(protectedHeader.alg).toBe('HS256');
    expect(payload.sub).toBe('account-id');
    expect(payload.iat).toEqual(expect.any(Number));
    expect(payload.exp).toEqual(expect.any(Number));
  });

  test('rejects a secret shorter than 32 bytes', () => {
    expect(() => new JoseTokenGenerator('too-short')).toThrow(
      'JWT_SECRET must be at least 32 bytes long'
    );
  });
});
