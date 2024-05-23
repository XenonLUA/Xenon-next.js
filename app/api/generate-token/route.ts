import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

interface Tokens {
	[key: string]: boolean;
}

let tokens: Tokens = {}; // In-memory token store (use a database in production)

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const token = crypto.randomBytes(16).toString('hex');
	tokens[token] = true; // Save the token
	res.status(200).json({ token });
}
