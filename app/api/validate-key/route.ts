import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
	try {
		const { key } = await req.json();

		if (typeof key !== 'string') {
			return NextResponse.json({ valid: false, message: 'Key must be a string' }, { status: 400 });
		}

		const { data, error } = await supabase
			.from('valid_keys')
			.select('*')
			.eq('key', key)
			.single();

		if (error) {
			throw error;
		}

		if (data && new Date(data.expiry) > new Date()) {
			return NextResponse.json({ valid: true }, { status: 200 });
		} else {
			return NextResponse.json({ valid: false }, { status: 200 });
		}
	} catch (error) {
		if (error instanceof SyntaxError) {
			return NextResponse.json({ message: 'Invalid JSON format' }, { status: 400 });
		}

		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
