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
		const { key } = await req.json();

		if (!key) {
			return NextResponse.json({ message: 'Key is required' }, { status: 400 });
		}

		const expiry = validKeys[key];
		if (expiry && new Date(expiry) > new Date()) {
			return NextResponse.json({ valid: true }, { status: 200 });
		} else {
			return NextResponse.json({ valid: false }, { status: 200 });
		}
	} catch (error) {
		console.error('Error validating key:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
