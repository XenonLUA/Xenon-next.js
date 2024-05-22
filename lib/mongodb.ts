import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!, {
	// Hapus opsi yang tidak dikenali
	// useNewUrlParser: true,
	// useUnifiedTopology: true,
});

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
	if (!global._mongoClientPromise) {
		global._mongoClientPromise = client.connect();
	}
	clientPromise = global._mongoClientPromise;
} else {
	clientPromise = client.connect();
}

export { clientPromise };
