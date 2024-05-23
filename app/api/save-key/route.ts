import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
	try {
		const { key, expiry } = await req.json();
		console.log("Received request with key:", key, "and expiry:", expiry);

		if (typeof key !== 'string' || typeof expiry !== 'string') {
			console.log("Invalid key or expiry format");
			return NextResponse.json({ message: 'Key and expiry must be strings' }, { status: 400 });
		}

		const expiryDate = new Date(expiry);
		if (isNaN(expiryDate.getTime())) {
			console.log("Invalid expiry date format");
			return NextResponse.json({ message: 'Expiry must be a valid date' }, { status: 400 });
		}

		const { data, error } = await supabase
			.from('valid_keys')
			.insert([{ key, expiry: expiryDate.toISOString() }]);

		if (error) {
			throw error;
		}

		console.log("Saved key:", key, "Expiry:", expiry, "Result:", data);
		return NextResponse.json({ message: 'Key saved successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error saving key:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
