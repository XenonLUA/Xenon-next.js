// pages/api/save-key.js
import { NextApiRequest, NextApiResponse } from 'next';

type ValidKeys = {
	[key: string]: string;
};

let validKeys: ValidKeys = {}; // Penyimpanan dalam memori sederhana

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		res.status(405).json({ message: 'Method not allowed' });
		return;
	}

	const { key, expiry } = req.body;

	if (!key || !expiry) {
		res.status(400).json({ message: 'Key and expiry are required' });
		return;
	}

	validKeys[key] = expiry;

	res.status(200).json({ message: 'Key saved successfully' });
}
