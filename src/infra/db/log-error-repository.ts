import { Db } from 'mongodb';
import LogErrorRepository from '../../data/protocols/logErrorRepository';

export interface MongoErrorDocument {
  stack: string;
  date: Date;
}

export interface ErrorCollection {
  insertOne(document: MongoErrorDocument): Promise<unknown>;
}

export default class LogMongoRepository implements LogErrorRepository {
  constructor(private readonly errors: ErrorCollection) {}

  async logError(stack: string): Promise<void> {
    await this.errors.insertOne({
      stack,
      date: new Date(),
    });
  }
}

export const createMongoLogErrorRepository = (
  database: Db,
  collectionName = 'errors'
): LogMongoRepository =>
  new LogMongoRepository(
    database.collection<MongoErrorDocument>(collectionName)
  );
