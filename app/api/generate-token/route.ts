// /app/api/generate-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient'; // Adjust the import path as needed

export async function GET(req: NextRequest) {
	const token = uuidv4();

	try {
		const { data, error } = await supabase
			.from('tokens')
			.insert([{ token, status: 'generated' }]);

		if (error) {
			console.error('Supabase insert error:', error);
			return NextResponse.json({ success: false, message: 'Failed to save the token' }, { status: 500 });
		}

		return NextResponse.json({ token });
	} catch (error) {
		console.error('Error generating token:', error);
		return NextResponse.json({ success: false, message: 'Error generating token' }, { status: 500 });
	}
}
