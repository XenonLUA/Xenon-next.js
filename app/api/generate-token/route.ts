import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const token = uuidv4();
	res.status(200).json({ token });
}
