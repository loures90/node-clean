import Authorization, {
  AuthorizationModel,
  ErrorResponse,
} from '../domain/authorization';
import { LoadAccountByEmailRepository } from './loadAccountByEmailRepository';

export default class DbAuthorization implements Authorization {
  constructor(
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  ) {}

  async auth(
    authorization: AuthorizationModel
  ): Promise<ErrorResponse | undefined> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(
      authorization.email
    );

    if (!account) {
      return { status: 401, message: 'Invalid credentials' };
    }
  }
}
