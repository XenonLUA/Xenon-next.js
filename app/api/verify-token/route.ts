// /app/api/verify-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getValidTokens } from '../generate-token/route';

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const token = searchParams.get('token');

	if (!token) {
		return NextResponse.json({ success: false, message: "No token provided" }, { status: 400 });
	}

	const validTokens = getValidTokens();

	if (validTokens.has(token)) {
		validTokens.delete(token); // Optionally, remove the token after successful verification
		return NextResponse.json({ success: true });
	} else {
		return NextResponse.json({ success: false, message: "Invalid token" }, { status: 400 });
	}
}
