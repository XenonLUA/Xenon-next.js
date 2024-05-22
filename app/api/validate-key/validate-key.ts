// pages/api/validate-key.js
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
