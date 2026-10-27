import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { Controller } from '../presentation/protocols/controller';
import openApiDocument from './openapi-document';

export default function makeApp(loginController: Controller): Express {
  const app = express();

  app.use(express.json());
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get('/api-docs.json', (_request, response) => {
    response.json(openApiDocument);
  });

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
