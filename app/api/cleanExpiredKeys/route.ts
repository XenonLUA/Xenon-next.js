import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
	try {
		const { data, error } = await supabase
			.from('valid_keys')
			.delete()
			.lt('expiry', new Date().toISOString());

		if (error) {
			throw error;
		}

		console.log('Deleted expired keys:', data);
		return NextResponse.json({ message: 'Expired keys cleaned up successfully' });
	} catch (error) {
		console.error('Error deleting expired keys:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
