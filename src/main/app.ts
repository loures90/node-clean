import express, { Express } from 'express';
import { Controller } from '../presentation/protocols/controller';

export default function makeApp(loginController: Controller): Express {
  const app = express();

  app.use(express.json());
  app.post('/api/login', async (request, response) => {
    const httpResponse = await loginController.handle({
      body: request.body,
      headers: request.headers,
      params: request.params,
    });

    response.status(httpResponse.statusCode).json(httpResponse.body);
  });

  return app;
}
