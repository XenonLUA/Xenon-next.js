// /app/api/verify-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Mock token store (in-memory)
const validTokens: Set<string> = new Set(['valid-token']); // Add the generated tokens here

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const token = searchParams.get('token');

	if (token === null) {
		return NextResponse.json({ success: false }, { status: 400 });
	}

	try {
		const isValid = validTokens.has(token);
		if (isValid) {
			return NextResponse.json({ success: true });
		} else {
			return NextResponse.json({ success: false }, { status: 400 });
		}
	} catch (error) {
		console.error('Error verifying token:', error);
		return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
	}
}
