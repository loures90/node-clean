import 'dotenv/config';
import { hash } from 'bcryptjs';
import { MongoClient } from 'mongodb';

const seedUser = async (): Promise<void> => {
  const {
    MONGODB_URI,
    MONGODB_DATABASE,
    SEED_USER_EMAIL,
    SEED_USER_PASSWORD,
    SEED_USER_NAME = 'User Name',
  } = process.env;

  if (!MONGODB_URI || !MONGODB_DATABASE) {
    throw new Error('MONGODB_URI and MONGODB_DATABASE must be configured');
  }
  if (!SEED_USER_EMAIL || !SEED_USER_PASSWORD) {
    throw new Error(
      'SEED_USER_EMAIL and SEED_USER_PASSWORD must be configured'
    );
  }
  if (!SEED_USER_NAME.trim()) {
    throw new Error('SEED_USER_NAME must not be empty');
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const accounts = client.db(MONGODB_DATABASE).collection('accounts');
    const passwordHash = await hash(SEED_USER_PASSWORD, 12);
    const result = await accounts.updateOne(
      { email: SEED_USER_EMAIL },
      {
        $setOnInsert: {
          email: SEED_USER_EMAIL,
          name: SEED_USER_NAME,
          passwordHash,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount === 1) {
      console.log(`Seed account created for ${SEED_USER_EMAIL}`);
    } else {
      console.log(`Seed account already exists for ${SEED_USER_EMAIL}`);
    }
  } finally {
    await client.close();
  }
};

seedUser().catch((error: unknown) => {
  console.error('Failed to seed initial account', error);
  process.exitCode = 1;
});
