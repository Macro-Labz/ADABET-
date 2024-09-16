import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ status: 'error', message: 'Wallet address is required' });
    }

    try {
      const { data: predictions, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('creator_wallet_address', walletAddress)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json({ status: 'success', predictions });
    } catch (error: any) {
      console.error('Error fetching user predictions:', error);
      res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch user predictions' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}