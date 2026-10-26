import { EmailValidator } from '../presentation/protocols/email-validator';

export default class SimpleEmailValidator implements EmailValidator {
  isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
