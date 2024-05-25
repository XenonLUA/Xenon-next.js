// /app/api/generate-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
	const token = uuidv4();
	console.log('Generated token:', token);  // Add this line for debugging
	return NextResponse.json({ token });
}
