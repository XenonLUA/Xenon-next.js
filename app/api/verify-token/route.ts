// /app/api/verify-token/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/utils'; // Adjust the path to your Supabase client

export async function POST(request: NextRequest) {
	try {
		// Update the token status to 'verified' for all 'pending' tokens
		const { data, error } = await supabase
			.from('tokens')
			.update({ status: 'verified' })
			.eq('status', 'pending');

		if (error) {
			console.error('Error updating token status:', error);
			return NextResponse.json({ success: false, message: 'Failed to verify tokens' }, { status: 500 });
		}

		return NextResponse.json({ success: true, message: 'Tokens verified successfully' });

	} catch (error) {
		console.error('Error verifying tokens:', error);
		return NextResponse.json({ success: false, message: 'Error verifying tokens' }, { status: 500 });
	}
}
