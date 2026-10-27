import { jest } from '@jest/globals';
import { MongoClient } from 'mongodb';
import LogMongoRepository, {
  ErrorCollection,
  MongoErrorDocument,
  createMongoLogErrorRepository,
} from '../../../src/infra/db/log-error-repository';

describe('LogMongoRepository', () => {
  test('stores the error stack and date', async () => {
    const insertedDocuments: MongoErrorDocument[] = [];
    const collection: ErrorCollection = {
      insertOne: jest.fn(async (document: MongoErrorDocument) => {
        insertedDocuments.push(document);
      }),
    };
    const repository = new LogMongoRepository(collection);
    const beforeLog = new Date();

    await repository.logError('error stack');

    const afterLog = new Date();
    expect(collection.insertOne).toHaveBeenCalledTimes(1);
    expect(collection.insertOne).toHaveBeenCalledWith({
      stack: 'error stack',
      date: expect.any(Date),
    });

    const document = insertedDocuments[0];
    expect(document?.date.getTime()).toBeGreaterThanOrEqual(
      beforeLog.getTime()
    );
    expect(document?.date.getTime()).toBeLessThanOrEqual(afterLog.getTime());
  });

  test('propagates errors from MongoDB', async () => {
    const persistenceError = new Error('Database unavailable');
    const collection: ErrorCollection = {
      insertOne: jest.fn(async (_document: MongoErrorDocument) => {
        throw persistenceError;
      }),
    };
    const repository = new LogMongoRepository(collection);

    await expect(repository.logError('error stack')).rejects.toBe(
      persistenceError
    );
  });

  test('uses the errors collection by default', async () => {
    const client = new MongoClient('mongodb://localhost:27017');
    const database = client.db('test');
    const collectionSpy = jest.spyOn(database, 'collection');

    createMongoLogErrorRepository(database);

    expect(collectionSpy).toHaveBeenCalledWith('errors');
    await client.close();
  });

  test('supports a custom collection name', async () => {
    const client = new MongoClient('mongodb://localhost:27017');
    const database = client.db('test');
    const collectionSpy = jest.spyOn(database, 'collection');

    createMongoLogErrorRepository(database, 'application-errors');

    expect(collectionSpy).toHaveBeenCalledWith('application-errors');
    await client.close();
  });
});
