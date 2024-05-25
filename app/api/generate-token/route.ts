// /app/api/generate-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const generateRandomToken = (length: number) => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let token = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		token += characters[randomIndex];
	}
	return token;
};

const checkTokenExists = async (token: string) => {
	const { data, error } = await supabase
		.from('tokens')
		.select('token')
		.eq('token', token);

	if (error) {
		console.error('Error checking token:', error);
		return false;
	}

	return data.length > 0;
};

const generateUniqueToken = async (length: number) => {
	let token;
	let exists = true;

	while (exists) {
		token = generateRandomToken(length);
		exists = await checkTokenExists(token);
	}

	return token;
};

export async function GET(req: NextRequest) {
	const token = await generateUniqueToken(32); // Generate a unique 32-character random token
	console.log('Generated unique token:', token);  // Add this line for debugging
	return NextResponse.json({ token });
}
