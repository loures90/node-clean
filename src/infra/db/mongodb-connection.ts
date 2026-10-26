import { Db, MongoClient } from 'mongodb';

export default class MongoConnection {
  private client?: MongoClient;
  private database?: Db;

  constructor(
    private readonly uri: string,
    private readonly databaseName: string
  ) {}

  async connect(): Promise<Db> {
    if (this.database) {
      return this.database;
    }

    const client = new MongoClient(this.uri);
    await client.connect();
    this.client = client;
    this.database = client.db(this.databaseName);

    return this.database;
  }

  async close(): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.client.close();
    this.client = undefined;
    this.database = undefined;
  }
}

export const createMongoConnectionFromEnvironment = (): MongoConnection => {
  const { MONGODB_URI, MONGODB_DATABASE } = process.env;
  if (!MONGODB_URI || !MONGODB_DATABASE) {
    throw new Error('MONGODB_URI and MONGODB_DATABASE must be configured');
  }

  return new MongoConnection(MONGODB_URI, MONGODB_DATABASE);
};
