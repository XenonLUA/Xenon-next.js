import { NextApiRequest, NextApiResponse } from 'next';

type ValidKeys = {
	[key: string]: string;
};

// Simple in-memory storage
let validKeys: ValidKeys = {
	"exampleKey1": "2024-12-31T23:59:59Z",
	"exampleKey2": "2025-01-31T23:59:59Z"
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		res.status(405).json({ message: 'Method not allowed' });
		return;
	}

	const { key, expiry } = req.body;

	if (typeof key !== 'string' || typeof expiry !== 'string') {
		res.status(400).json({ message: 'Key and expiry must be strings' });
		return;
	}

	if (isNaN(Date.parse(expiry))) {
		res.status(400).json({ message: 'Expiry must be a valid date' });
		return;
	}

	try {
		validKeys[key] = expiry;
		res.status(200).json({ message: 'Key saved successfully' });
	} catch (error) {
		console.error('Error saving key:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}
