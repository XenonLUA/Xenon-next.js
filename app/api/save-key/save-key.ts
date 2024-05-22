import { NextApiRequest, NextApiResponse } from 'next';

// Data storage for keys (temporary solution)
let validKeys: { [key: string]: string } = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method not allowed' });
	}

	const { key, expiry } = req.body;

	if (!key || !expiry) {
		return res.status(400).json({ message: 'Key and expiry are required' });
	}

	validKeys[key] = expiry;

	return res.status(200).json({ message: 'Key saved successfully' });
}
