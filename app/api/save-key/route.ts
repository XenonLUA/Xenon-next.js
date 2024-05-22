// /pages/api/save-key.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
	try {
		const { key, expiry } = await req.json();

		console.log("Received key:", key);
		console.log("Received expiry:", expiry);

		if (typeof key !== 'string' || typeof expiry !== 'string') {
			console.error("Invalid key or expiry format");
			return NextResponse.json({ message: 'Key and expiry must be strings' }, { status: 400 });
		}

		if (isNaN(Date.parse(expiry))) {
			console.error("Invalid expiry date format");
			return NextResponse.json({ message: 'Expiry must be a valid date' }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db(process.env.MONGODB_DB);
		const collection = db.collection('validKeys');

		const result = await collection.insertOne({ key, expiry });

		console.log("Insert result:", result);
		console.log("Saved key:", key, "Expiry:", expiry);
		return NextResponse.json({ message: 'Key saved successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error saving key:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
