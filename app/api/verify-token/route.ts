// /app/api/verify-token/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
	try {
		const { uuid, token } = await req.json();

		if (!uuid || !token) {
			return NextResponse.json({ success: false, message: 'UUID and token are required' }, { status: 400 });
		}

		const { data, error } = await supabase
			.from('tokens')
			.select('*')
			.eq('uuid', uuid)
			.eq('token', token)
			.single();

		if (error || !data || data.status !== 'pending') {
			return NextResponse.json({ success: false, message: 'Invalid or already used token' }, { status: 400 });
		}

		const { error: updateError } = await supabase
			.from('tokens')
			.update({ status: 'completed' })
			.eq('uuid', uuid)
			.eq('token', token);

		if (updateError) {
			return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		if (error instanceof Error) {
			return NextResponse.json({ success: false, message: error.message }, { status: 500 });
		}
		return NextResponse.json({ success: false, message: "An unknown error occurred" }, { status: 500 });
	}
}
