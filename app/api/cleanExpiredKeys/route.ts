import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const { data, error } = await supabase
			.from('valid_keys')
			.delete()
			.lt('expiry', new Date().toISOString());

		if (error) {
			throw error;
		}

		console.log('Deleted expired keys:', data);
		res.status(200).json({ message: 'Expired keys cleaned up successfully' });
	} catch (error) {
		console.error('Error deleting expired keys:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}
