import { NextRequest, NextResponse } from 'next/server';

type ValidKeys = {
	[key: string]: string;
};

// Assume the same in-memory storage from save-key
let validKeys: ValidKeys = {
	"exampleKey1": "2024-12-31T23:59:59Z",
	"exampleKey2": "2025-01-31T23:59:59Z"
};

export async function POST(req: NextRequest) {
	try {
		const { key } = await req.json();

		if (typeof key !== 'string') {
			return NextResponse.json({ message: 'Key must be a string' }, { status: 400 });
		}

		const expiry = validKeys[key];

		if (!expiry) {
			return NextResponse.json({ message: 'Invalid key' }, { status: 400 });
		}

		return NextResponse.json({ message: 'Key is valid', expiry }, { status: 200 });
	} catch (error) {
		console.error('Error validating key:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
