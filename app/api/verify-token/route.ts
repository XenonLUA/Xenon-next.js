// /app/api/verify-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Adjust the import path as needed

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const token = searchParams.get('token');

	if (!token) {
		return NextResponse.json({ success: false, message: 'No token provided' }, { status: 400 });
	}

	try {
		const { data, error } = await supabase
			.from('tokens')
			.select('*')
			.eq('token', token)
			.eq('status', 'generated')
			.single();

		if (error || !data) {
			console.error('Invalid or expired token:', token);
			return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 400 });
		}

		const { error: updateError } = await supabase
			.from('tokens')
			.update({ status: 'used' })
			.eq('token', token);

		if (updateError) {
			console.error('Failed to update token status:', token, updateError);
			return NextResponse.json({ success: false, message: 'Failed to update token status' }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error verifying token:', error);
		return NextResponse.json({ success: false, message: 'Error verifying token' }, { status: 500 });
	}
}
