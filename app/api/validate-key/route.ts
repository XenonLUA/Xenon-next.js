import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
	try {
		const { key } = await req.json();
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

		if (error) {
			throw error;
		}

		if (!data) {
			return NextResponse.json({ valid: false, message: 'Invalid key' }, { status: 200 });
		}

		const now = new Date();
		const expiryDate = new Date(data.expiry);

		if (now > expiryDate) {
			return NextResponse.json({ valid: false, expired: true, message: 'Key has expired' }, { status: 200 });
		}

		return NextResponse.json({ valid: true, message: 'Key is valid' }, { status: 200 });
	} catch (error) {
		console.error('Error validating key:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
