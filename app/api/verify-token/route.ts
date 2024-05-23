import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, removeToken } from '@/validTokensStore';

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const token = searchParams.get('token');

	console.log(`Received token for verification: ${token}`);

	if (!token) {
		return NextResponse.json({ success: false, message: "No token provided" }, { status: 400 });
	}

	if (isValidToken(token)) {
		console.log(`Token is valid: ${token}`);
		removeToken(token); // Optionally, remove the token after successful verification
		return NextResponse.json({ success: true });
	} else {
		console.error(`Invalid token: ${token}`);
		return NextResponse.json({ success: false, message: "Invalid token" }, { status: 400 });
	}
}
