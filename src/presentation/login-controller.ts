import Authorization from '../domain/authorization';
import { Controller } from './protocols/controller';
import { HttpRequest, HttpResponse } from './protocols/http';
import { EmailValidator } from './protocols/email-validator';

export default class LoginController implements Controller {
  constructor(
    private readonly emailValidator: EmailValidator,
    private readonly authorization: Authorization
  ) {}

  async handle({ body }: HttpRequest): Promise<HttpResponse> {
    try {
      if (typeof body?.email !== 'string' || body.email.trim() === '') {
        return { statusCode: 400, body: { message: 'email is required' } };
      }

      if (typeof body.password !== 'string' || body.password.length === 0) {
        return { statusCode: 400, body: { message: 'password is required' } };
      }

      if (!this.emailValidator.isValid(body.email)) {
        return { statusCode: 400, body: { message: 'email is invalid' } };
      }

      const result = await this.authorization.auth({
        email: body.email,
        password: body.password,
      });

      if ('status' in result) {
        return { statusCode: result.status, body: { message: result.message } };
      }

      return { statusCode: 200, body: result };
    } catch {
      return {
        statusCode: 500,
        body: { message: 'Internal server error' },
      };
    }
  }
}
