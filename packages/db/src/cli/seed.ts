import { createDb } from '../client.js';
import { seedReferenceData } from '../seed.js';

const url = process.env.DATABASE_URL;
if (!url) {
	console.error('DATABASE_URL is required');
	process.exit(1);
}

const { db, close } = createDb(url, { max: 1 });
try {
	await seedReferenceData(db);
	console.log('Reference data seeded');
} finally {
	await close();
}
