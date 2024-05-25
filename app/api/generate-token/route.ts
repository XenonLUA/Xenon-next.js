// /app/api/generate-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

const generateRandomToken = (length: number) => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let token = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		token += characters[randomIndex];
	}
	return token;
};

export async function GET(req: NextRequest) {
	const token = generateRandomToken(32); // Generate a 32-character random token
	console.log('Generated token:', token);  // Add this line for debugging
	return NextResponse.json({ token });
}
