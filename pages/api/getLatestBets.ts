import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data: latestBets, error } = await supabase
        .from('bets')
        .select(`
          id,
          prediction_id,
          user_wallet_address,
          amount,
          bet_type,
          created_at,
          transaction_id,
          predictions (
            title
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      console.log('Latest bets fetched:', latestBets);

      const formattedBets = latestBets.map(bet => ({
        id: bet.id,
        prediction_id: bet.prediction_id,
        user_wallet_address: bet.user_wallet_address || 'Anonymous',
        amount: bet.amount || 0,
        bet_type: bet.bet_type || 'unknown',
        created_at: bet.created_at ? new Date(bet.created_at).toISOString() : new Date().toISOString(),
        prediction_title: bet.predictions?.title || 'Unknown Prediction',
        transaction_id: bet.transaction_id || 'N/A'
      }));

      res.status(200).json({ bets: formattedBets });
    } catch (error) {
      console.error('Error fetching latest bets:', error);
      res.status(500).json({ message: 'Error fetching latest bets' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}