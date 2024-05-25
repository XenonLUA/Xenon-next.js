// /app/api/verify-token/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/utils';

export async function POST(req: NextRequest) {
	try {
		const { token } = await req.json();

		const { data, error } = await supabase
			.from('tokens')
			.select('*')
			.eq('token', token)
			.single();

		if (error || !data) {
			return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 400 });
		}

		const currentTime = new Date();
		const tokenCreationTime = new Date(data.created_at);
		const timeDifference = currentTime.getTime() - tokenCreationTime.getTime();

		// Define a valid time period (e.g., 1 hour)
		const validTimePeriod = 60 * 60 * 1000; // 1 hour in milliseconds

		if (data.status !== 'pending' || timeDifference > validTimePeriod) {
			return NextResponse.json({ success: false, message: 'Token is either already used or expired' }, { status: 400 });
		}

		await supabase
			.from('tokens')
			.update({ status: 'completed' })
			.eq('token', token);

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		if (error instanceof Error) {
			return NextResponse.json({ success: false, message: error.message }, { status: 500 });
		}
		return NextResponse.json({ success: false, message: "An unknown error occurred" }, { status: 500 });
	}
}
