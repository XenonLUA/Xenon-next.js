// /app/api/generate-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { addToken } from '@/validTokensStore';

export async function GET(req: NextRequest) {
	const token = uuidv4();
	addToken(token);
	return NextResponse.json({ token });
}
