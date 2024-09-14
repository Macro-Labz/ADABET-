import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ status: 'error', message: 'Wallet address is required' });
    }

    const decodedWalletAddress = decodeURIComponent(walletAddress as string);
    console.log('Fetching bets for wallet address:', decodedWalletAddress);

    try {
      // First, let's check the structure of the bets table
      const { data: tableInfo, error: tableError } = await supabase
        .from('bets')
        .select('*')
        .limit(1);

      if (tableError) throw tableError;

      console.log('Bets table structure:', tableInfo);

      // Now let's query for the bets
      const { data: bets, error } = await supabase
        .from('bets')
        .select(`
          id,
          prediction_id,
          amount,
          bet_type,
          created_at,
          transaction_id,
          predictions (
            title
          )
        `)
        // Replace 'wallet_address' with the correct column name
        .eq('user_wallet_address', decodedWalletAddress)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched bets:', bets);
      return res.status(200).json({ status: 'success', bets });
    } catch (error) {
      console.error('Error fetching user bets:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}