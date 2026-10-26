import Authorization, {
  AuthorizationSuccess,
  AuthorizationModel,
  ErrorResponse,
} from '../domain/authorization';
import { HashComparer } from './hashComparer';
import { LoadAccountByEmailRepository } from './loadAccountByEmailRepository';
import { TokenGenerator } from './tokenGenerator';

export default class DbAuthorization implements Authorization {
  constructor(
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository,
    private readonly hashComparer: HashComparer,
    private readonly tokenGenerator: TokenGenerator
  ) {}

  async auth(
    authorization: AuthorizationModel
  ): Promise<ErrorResponse | AuthorizationSuccess> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(
      authorization.email
    );

    if (!account) {
      return { status: 401, message: 'Invalid credentials' };
    }

    const passwordIsValid = await this.hashComparer.compare(
      authorization.password,
      account.passwordHash
    );

    if (!passwordIsValid) {
      return { status: 401, message: 'Invalid credentials' };
    }

    const accessToken = await this.tokenGenerator.generate(account.id);

    return { accessToken, name: account.name };
  }
}
