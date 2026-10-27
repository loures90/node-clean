import { SignJWT } from 'jose';
import { TokenGenerator } from '../data/protocols/tokenGenerator';

export default class JoseTokenGenerator implements TokenGenerator {
  private readonly key: Uint8Array;

  constructor(secret: string) {
    if (new TextEncoder().encode(secret).byteLength < 32) {
      throw new Error('JWT_SECRET must be at least 32 bytes long');
    }

    this.key = new TextEncoder().encode(secret);
  }

  generate(accountId: string): Promise<string> {
    return new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(accountId)
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(this.key);
  }
}

export const createJoseTokenGeneratorFromEnvironment =
  (): JoseTokenGenerator => {
    const { JWT_SECRET } = process.env;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET must be configured');
    }

    return new JoseTokenGenerator(JWT_SECRET);
  };
