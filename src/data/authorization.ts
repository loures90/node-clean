import Authorization, {
  AuthorizationModel,
  LoadAccountByEmailRepository,
} from '../domain/authorization';

export default class DbAuthorization implements Authorization {
  constructor(
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  ) {}

  async auth(authorization: AuthorizationModel): Promise<void> {
    await this.loadAccountByEmailRepository.loadByEmail(authorization.email);
  }
}
