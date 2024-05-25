import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const checkTokenExists = async (token: string) => {
	const { data, error } = await supabase
		.from('tokens')
		.select('token_id')
		.eq('token_id', token);

	if (error) {
		console.error('Error checking token:', error);
		return false;
	}

	return data.length > 0;
};

const generateUniqueToken = async () => {
	let token;
	let exists = true;

	while (exists) {
		token = uuidv4(); // Menggunakan uuidv4() untuk generate token
		exists = await checkTokenExists(token);
	}

	return token;
};

export async function GET(req: NextRequest) {
	const token = await generateUniqueToken();
	console.log('Generated unique token:', token);
	return NextResponse.json({ token });
}
