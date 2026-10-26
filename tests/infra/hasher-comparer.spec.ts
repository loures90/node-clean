import { hash } from 'bcryptjs';
import BcryptHashComparer from '../../src/infra/hasher-comparer';

describe('BcryptHashComparer', () => {
  test('returns true when the value matches the hash', async () => {
    const hashedPassword = await hash('correct-password', 4);
    const sut = new BcryptHashComparer();

    await expect(sut.compare('correct-password', hashedPassword)).resolves.toBe(
      true
    );
  });

  test('returns false when the value does not match the hash', async () => {
    const hashedPassword = await hash('correct-password', 4);
    const sut = new BcryptHashComparer();

    await expect(sut.compare('wrong-password', hashedPassword)).resolves.toBe(
      false
    );
  });
});
