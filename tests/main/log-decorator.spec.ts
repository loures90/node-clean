import { jest } from '@jest/globals';
import LogErrorRepository from '../../src/data/protocols/logErrorRepository';
import { LogControllerDecorator } from '../../src/main/log-decorator';
import { Controller } from '../../src/presentation/protocols/controller';
import {
  HttpRequest,
  HttpResponse,
} from '../../src/presentation/protocols/http';

describe('LogControllerDecorator', () => {
  const httpRequest: HttpRequest = { body: { email: 'user@example.com' } };

  test('logs the stack when the controller returns a 500 response', async () => {
    const httpResponse: HttpResponse = {
      statusCode: 500,
      body: { stack: 'error stack' },
    };
    const controller: Controller = {
      handle: jest.fn(async (_request: HttpRequest) => httpResponse),
    };
    const logErrorRepository: LogErrorRepository = {
      logError: jest.fn(async (_stack: string) => undefined),
    };
    const decorator = new LogControllerDecorator(
      controller,
      logErrorRepository
    );

    const response = await decorator.handle(httpRequest);

    expect(controller.handle).toHaveBeenCalledWith(httpRequest);
    expect(logErrorRepository.logError).toHaveBeenCalledWith('error stack');
    expect(response).toBe(httpResponse);
  });

  test('does not log when the controller returns a non-500 response', async () => {
    const httpResponse: HttpResponse = {
      statusCode: 401,
      body: { message: 'Unauthorized' },
    };
    const controller: Controller = {
      handle: jest.fn(async (_request: HttpRequest) => httpResponse),
    };
    const logErrorRepository: LogErrorRepository = {
      logError: jest.fn(async (_stack: string) => undefined),
    };
    const decorator = new LogControllerDecorator(
      controller,
      logErrorRepository
    );

    const response = await decorator.handle(httpRequest);

    expect(logErrorRepository.logError).not.toHaveBeenCalled();
    expect(response).toBe(httpResponse);
  });

  test('propagates errors raised while persisting a log', async () => {
    const httpResponse: HttpResponse = {
      statusCode: 500,
      body: { stack: 'error stack' },
    };
    const persistenceError = new Error('Database unavailable');
    const controller: Controller = {
      handle: jest.fn(async (_request: HttpRequest) => httpResponse),
    };
    const logErrorRepository: LogErrorRepository = {
      logError: jest.fn(async (_stack: string) => {
        throw persistenceError;
      }),
    };
    const decorator = new LogControllerDecorator(
      controller,
      logErrorRepository
    );

    await expect(decorator.handle(httpRequest)).rejects.toBe(persistenceError);
  });
});
