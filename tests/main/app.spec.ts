import { jest } from '@jest/globals';
import request from 'supertest';
import makeApp from '../../src/main/app';
import { Controller } from '../../src/presentation/protocols/controller';
import {
  HttpRequest,
  HttpResponse,
} from '../../src/presentation/protocols/http';

describe('POST /api/login', () => {
  test('forwards the request body to the login controller and returns its response', async () => {
    const controller: Controller = {
      handle: jest.fn(
        async (httpRequest: HttpRequest): Promise<HttpResponse> => {
          expect(httpRequest.body).toEqual({
            email: 'user@example.com',
            password: 'password123',
          });
          return {
            statusCode: 200,
            body: { accessToken: 'generated-token', name: 'User Name' },
          };
        }
      ),
    };
    const app = makeApp(controller);

    const response = await request(app)
      .post('/api/login')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: 'generated-token',
      name: 'User Name',
    });
    expect(controller.handle).toHaveBeenCalledTimes(1);
  });

  test('returns the status and body provided by the controller', async () => {
    const controller: Controller = {
      handle: jest.fn(async () => ({
        statusCode: 400,
        body: { message: 'email is invalid' },
      })),
    };
    const app = makeApp(controller);

    const response = await request(app)
      .post('/api/login')
      .send({ email: 'invalid-email', password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'email is invalid' });
  });
});
