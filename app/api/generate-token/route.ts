// /app/api/generate-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const validTokens: Set<string> = new Set();

export async function GET(req: NextRequest) {
	const token = uuidv4();
	validTokens.add(token);
	return NextResponse.json({ token });
}

export function getValidTokens() {
	return validTokens;
}
