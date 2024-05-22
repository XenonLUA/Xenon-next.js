import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
	try {
		const { key, expiry } = await req.json();

		// Validate input types
		if (typeof key !== 'string' || typeof expiry !== 'string') {
			return NextResponse.json({ message: 'Key and expiry must be strings' }, { status: 400 });
		}

		// Validate expiry date
		if (isNaN(Date.parse(expiry))) {
			return NextResponse.json({ message: 'Expiry must be a valid date' }, { status: 400 });
		}

		// Connect to MongoDB
		const client = await clientPromise;
		const db = client.db(process.env.MONGODB_DB);

		if (!db) {
			throw new Error('Database connection failed');
		}

		const collection = db.collection('validKeys');

		// Insert the key and expiry into the collection
		await collection.insertOne({ key, expiry });

		console.log("Saved key:", key, "Expiry:", expiry);
		return NextResponse.json({ message: 'Key saved successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error saving key:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
