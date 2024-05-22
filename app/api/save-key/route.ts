import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
	try {
		const { key, expiry } = await req.json();

		if (typeof key !== 'string' || typeof expiry !== 'string') {
			return NextResponse.json({ message: 'Key and expiry must be strings' }, { status: 400 });
		}

		if (isNaN(Date.parse(expiry))) {
			return NextResponse.json({ message: 'Expiry must be a valid date' }, { status: 400 });
		}

		const client = await clientPromise;
		const db = client.db(process.env.MONGODB_DB);
		const collection = db.collection('validKeys');

		await collection.insertOne({ key, expiry });

		console.log("Saved key:", key, "Expiry:", expiry);
		return NextResponse.json({ message: 'Key saved successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error saving key:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
