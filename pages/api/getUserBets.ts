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
        .eq('user_wallet_address', walletAddress)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Use a Map to keep only unique bets based on transaction_id
      const uniqueBetsMap = new Map();
      bets.forEach(bet => {
        if (!uniqueBetsMap.has(bet.transaction_id)) {
          uniqueBetsMap.set(bet.transaction_id, bet);
        }
      });

      const formattedBets = Array.from(uniqueBetsMap.values()).map(bet => ({
        ...bet,
        prediction_title: bet.predictions.title,
        transaction_id: bet.transaction_id || 'N/A' // Provide a default value if transaction_id is null
      }));

      res.status(200).json({ status: 'success', bets: formattedBets });
    } catch (error) {
      console.error('Error fetching user bets:', error);
      res.status(500).json({ status: 'error', message: 'Error fetching user bets' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}