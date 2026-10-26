import Authorization, {
  AuthorizationModel,
  ErrorResponse,
  LoadAccountByEmailRepository,
} from '../domain/authorization';

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
