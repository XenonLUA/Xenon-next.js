import { MongoClient } from 'mongodb';

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
	throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

if (process.env.NODE_ENV === 'development') {
	if (!global._mongoClientPromise) {
		client = new MongoClient(uri, options);
		global._mongoClientPromise = client.connect();
	}
	clientPromise = global._mongoClientPromise as Promise<MongoClient>;
} else {
	client = new MongoClient(uri, options);
	clientPromise = client.connect();
}

clientPromise.then(() => console.log('Connected to MongoDB')).catch(err => console.error('MongoDB connection error:', err));

export { clientPromise };
