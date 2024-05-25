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

		if (error || !data || data.status !== 'pending') {
			return NextResponse.json({ success: false, message: 'Invalid or already used token' }, { status: 400 });
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
