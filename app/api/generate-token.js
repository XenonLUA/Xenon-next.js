import crypto from 'crypto';

let tokens = {}; // In-memory token store (use a database in production)

export default function handler(req, res) {
	const token = crypto.randomBytes(16).toString('hex');
	tokens[token] = true; // Save the token
	res.status(200).json({ token });
}
