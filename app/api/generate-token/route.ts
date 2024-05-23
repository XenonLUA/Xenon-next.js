// /app/api/generate-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock token store (in-memory)
const validTokens: Set<string> = new Set();

export async function GET(req: NextRequest) {
	const token = uuidv4();
	validTokens.add(token); // Add the generated token to the valid tokens set
	return NextResponse.json({ token });
}
