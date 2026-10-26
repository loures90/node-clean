import makeLoginController from '../application/login-controller-factory';
import makeApp from './app';

const startServer = async (): Promise<void> => {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const loginController = await makeLoginController();
  const app = makeApp(loginController);

  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
};

startServer().catch((error: unknown) => {
  console.error('Failed to start API server', error);
  process.exitCode = 1;
});
