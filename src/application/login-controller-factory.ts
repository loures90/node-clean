import DbAuthorization from '../data/usecases/authorization';
import BcryptHashComparer from '../infra/hasher-comparer';
import AccountRepository, {
  createMongoAccountRepository,
} from '../infra/db/account-repository';
import { createMongoConnectionFromEnvironment } from '../infra/db/mongodb-connection';
import SimpleEmailValidator from '../infra/email-validator';
import { createJoseTokenGeneratorFromEnvironment } from '../infra/token-generator';
import LoginController from '../presentation/login-controller';
import { createMongoLogErrorRepository } from '../infra/db/log-error-repository';
import { LogControllerDecorator } from '../main/log-decorator';
import { Controller } from '../presentation/protocols/controller';

export default async function makeLoginController(): Promise<Controller> {
  const tokenGenerator = createJoseTokenGeneratorFromEnvironment();
  const connection = createMongoConnectionFromEnvironment();
  const database = await connection.connect();
  const accountRepository: AccountRepository =
    createMongoAccountRepository(database);
  const logErrorRepository = createMongoLogErrorRepository(database);

  const authorization = new DbAuthorization(
    accountRepository,
    new BcryptHashComparer(),
    tokenGenerator,
    accountRepository
  );
  const controller = new LoginController(
    new SimpleEmailValidator(),
    authorization
  );
  return new LogControllerDecorator(controller, logErrorRepository);
}
