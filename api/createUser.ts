import { createUserAction } from '../actions/users';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { walletAddress } = req.body;
    try {
      const result = await createUserAction(walletAddress);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to create user' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}