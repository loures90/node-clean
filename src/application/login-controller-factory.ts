import DbAuthorization from '../data/authorization';
import BcryptHashComparer from '../infra/hasher-comparer';
import AccountRepository, {
  createMongoAccountRepository,
} from '../infra/db/account-repository';
import { createMongoConnectionFromEnvironment } from '../infra/db/mongodb-connection';
import SimpleEmailValidator from '../infra/email-validator';
import { createJoseTokenGeneratorFromEnvironment } from '../infra/token-generator';
import LoginController from '../presentation/login-controller';

export default async function makeLoginController(): Promise<LoginController> {
  const tokenGenerator = createJoseTokenGeneratorFromEnvironment();
  const connection = createMongoConnectionFromEnvironment();
  const database = await connection.connect();
  const accountRepository: AccountRepository =
    createMongoAccountRepository(database);
  const authorization = new DbAuthorization(
    accountRepository,
    new BcryptHashComparer(),
    tokenGenerator,
    accountRepository
  );

  return new LoginController(new SimpleEmailValidator(), authorization);
}
