import Authorization, {
  AuthorizationSuccess,
  AuthorizationModel,
  ErrorResponse,
  Account,
} from '../../domain/authorization';
import { HashComparer } from '../protocols/hashComparer';
import { LoadAccountByEmailRepository } from '../protocols/loadAccountByEmailRepository';
import { TokenGenerator } from '../protocols/tokenGenerator';
import { UpdateAccessTokenRepository } from '../protocols/updateAccessTokenRepository';

export default class DbAuthorization implements Authorization {
  constructor(
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository,
    private readonly hashComparer: HashComparer,
    private readonly tokenGenerator: TokenGenerator,
    private readonly updateAccessTokenRepository: UpdateAccessTokenRepository
  ) {}

  async auth(
    authorization: AuthorizationModel
  ): Promise<ErrorResponse | AuthorizationSuccess> {
    const account: Account | null =
      await this.loadAccountByEmailRepository.loadByEmail(authorization.email);

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
    await this.updateAccessTokenRepository.updateAccessToken(
      account.id,
      accessToken
    );

    return { accessToken, name: account.name };
  }
}
