import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/utils';  // Adjust the path to your Supabase client

export async function POST(request: NextRequest) {
	try {
		const { token } = await request.json();

		// Check the validity of the token in your database
		const { data, error } = await supabase
			.from('tokens')
			.select('*')
			.eq('token_id', token)
			.eq('status', 'pending')
			.single();

		if (error || !data) {
			return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 400 });
		}

		// Update the token status to 'verified' if it exists
		const { error: updateError } = await supabase
			.from('tokens')
			.update({ status: 'verified' })
			.eq('token_id', token);

		if (updateError) {
			return NextResponse.json({ success: false, message: 'Failed to verify token' }, { status: 500 });
		}

		return NextResponse.json({ success: true, message: 'Token verified successfully' });

	} catch (error) {
		return NextResponse.json({ success: false, message: 'Error verifying token' }, { status: 500 });
	}
}
