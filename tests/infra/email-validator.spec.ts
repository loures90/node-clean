import SimpleEmailValidator from '../../src/infra/email-validator';

describe('SimpleEmailValidator', () => {
  const sut = new SimpleEmailValidator();

  test.each(['user@example.com', 'first.last+tag@example.co.uk'])(
    'returns true for a valid-looking email: %s',
    (email) => {
      expect(sut.isValid(email)).toBe(true);
    }
  );

  test.each([
    '',
    'plain-text',
    'missing-at.example.com',
    'missing-domain@',
    '@missing-local.com',
    'white space@example.com',
  ])('returns false for an invalid email: %s', (email) => {
    expect(sut.isValid(email)).toBe(false);
  });
});
