// /app/api/verify-token/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/utils'; // Adjust the path to your Supabase client

export async function POST(request: NextRequest) {
	try {
		const { token } = await request.json();

		if (!token) {
			return NextResponse.json({ success: false, message: 'Token is required' }, { status: 400 });
		}

		// Check if the token with 'pending' status exists
		const { data, error } = await supabase
			.from('tokens')
			.select('token_id, status')
			.eq('token_id', token)
			.eq('status', 'pending')
			.single();

		if (error) {
			console.error('Error fetching token:', error);
			return NextResponse.json({ success: false, message: 'Error fetching token' }, { status: 500 });
		}

		if (!data) {
			return NextResponse.json({ success: false, message: 'Invalid token or not pending' }, { status: 400 });
		}

		// Update the token status to 'verified'
		const { error: updateError } = await supabase
			.from('tokens')
			.update({ status: 'verified' })
			.eq('token_id', token);

		if (updateError) {
			console.error('Error updating token status:', updateError);
			return NextResponse.json({ success: false, message: 'Failed to verify token' }, { status: 500 });
		}

		return NextResponse.json({ success: true, message: 'Token verified successfully' });

	} catch (error) {
		console.error('Error verifying token:', error);
		return NextResponse.json({ success: false, message: 'Error verifying token' }, { status: 500 });
	}
}
