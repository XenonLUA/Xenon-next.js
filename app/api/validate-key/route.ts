import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type ValidateKeyRequest = {
	key: string;
};

export async function POST(req: NextRequest) {
	try {
		const { key }: ValidateKeyRequest = await req.json();
		console.log("Received request with key:", key);

		if (typeof key !== 'string') {
			console.log("Invalid key format");
			return NextResponse.json({ message: 'Key must be a string' }, { status: 400 });
		}

		const { data, error } = await supabase
			.from('valid_keys')
			.select('*')
			.eq('key', key)
			.single();

		if (error || !data) {
			console.log("Key not found or error occurred");
			return NextResponse.json({ valid: false, message: 'Invalid key' }, { status: 200 });
		}

		const currentDateTime = new Date();
		const expiryDateTime = new Date(data.expiry);

		if (expiryDateTime < currentDateTime) {
			console.log("Key has expired");
			return NextResponse.json({ valid: false, expired: true, message: 'Key has expired' }, { status: 200 });
		}

		console.log("Key is valid and not expired");
		return NextResponse.json({ valid: true, expired: false, message: 'Key is valid' }, { status: 200 });
	} catch (error) {
		console.error('Error validating key:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
