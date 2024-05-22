import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
	try {
		const { key } = await req.json();

		if (typeof key !== 'string') {
			return NextResponse.json({ valid: false, message: 'Key must be a string' }, { status: 400 });
		}

		const client = await clientPromise;

		if (!client) {
			throw new Error('Failed to connect to the database');
		}

		const db = client.db(process.env.MONGODB_DB);

		if (!db) {
			throw new Error('Database connection failed');
		}

		const collection = db.collection('validKeys');

		const keyRecord = await collection.findOne({ key });

		if (keyRecord) {
			const expiryDate = new Date(keyRecord.expiry);
			if (expiryDate > new Date()) {
				return NextResponse.json({ valid: true }, { status: 200 });
			}
		}

		return NextResponse.json({ valid: false }, { status: 200 });
	} catch (error) {
		console.error('Error validating key:', error);

		if (error instanceof SyntaxError) {
			return NextResponse.json({ message: 'Invalid JSON format' }, { status: 400 });
		}

		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
