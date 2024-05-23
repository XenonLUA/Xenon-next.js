import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { token } = req.query as { token: string };

	try {
		const isValid = await verifyToken(token);
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

// Example function to verify token, replace with your actual logic
async function verifyToken(token: string): Promise<boolean> {
	// Dummy implementation for example
	return token === 'valid-token';
}
