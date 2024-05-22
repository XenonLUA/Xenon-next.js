// app/api/save-key/route.ts
import { NextRequest, NextResponse } from 'next/server';

type ValidKeys = {
	[key: string]: string;
};

// Simple in-memory storage
let validKeys: ValidKeys = {
	"exampleKey1": "2024-12-31T23:59:59Z",
	"exampleKey2": "2025-01-31T23:59:59Z"
};

export async function POST(req: NextRequest) {
	try {
		const { key, expiry } = await req.json();

		if (typeof key !== 'string' || typeof expiry !== 'string') {
			return NextResponse.json({ message: 'Key and expiry must be strings' }, { status: 400 });
		}

		if (isNaN(Date.parse(expiry))) {
			return NextResponse.json({ message: 'Expiry must be a valid date' }, { status: 400 });
		}

		validKeys[key] = expiry;
		console.log("Saved key:", key, "Expiry:", expiry);
		return NextResponse.json({ message: 'Key saved successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error saving key:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
