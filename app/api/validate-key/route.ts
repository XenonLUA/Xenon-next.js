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

	const { key } = req.body;

	if (!key) {
		res.status(400).json({ message: 'Key is required' });
		return;
	}

	const expiry = validKeys[key];
	if (expiry && new Date(expiry) > new Date()) {
		res.status(200).json({ valid: true });
	} else {
		res.status(200).json({ valid: false });
	}
}
