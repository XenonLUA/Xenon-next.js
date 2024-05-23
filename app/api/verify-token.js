let tokens = {}; // In-memory token store (use a database in production)

export default function handler(req, res) {
	const { token } = req.query;
	if (tokens[token]) {
		delete tokens[token]; // Token is valid, remove it to prevent reuse
		res.status(200).json({ success: true });
	} else {
		res.status(400).json({ success: false });
	}
}
