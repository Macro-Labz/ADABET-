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

    console.log('Fetching bets for wallet address:', walletAddress);

    try {
      const { data: bets, error } = await supabase
        .from('bets')
        .select(`
          *,
          predictions (id, title)
        `)
        .eq('user_wallet_address', walletAddress)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched bets:', bets);

      res.status(200).json({ status: 'success', bets });
    } catch (error: any) {
      console.error('Error fetching user bets:', error);
      res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch user bets' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}