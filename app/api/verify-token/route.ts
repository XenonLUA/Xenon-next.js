// /pages/api/verify-token.ts
import { NextApiRequest, NextApiResponse } from 'next';

// Mock token store (in-memory)
const validTokens: Set<string> = new Set(['valid-token']);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const { token } = req.query as { token: string };

	try {
		const isValid = validTokens.has(token);
		if (isValid) {
			res.status(200).json({ success: true });
		} else {
			res.status(400).json({ success: false });
		}
	} catch (error) {
		console.error('Error verifying token:', error);
		res.status(500).json({ success: false, error: 'Internal Server Error' });
	}
}
