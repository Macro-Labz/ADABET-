import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { predictionId } = req.query;

    if (!predictionId) {
      return res.status(400).json({ status: 'error', message: 'Prediction ID is required' });
    }

    try {
      const { data: bets, error } = await supabase
        .from('bets')
        .select('*')
        .eq('prediction_id', predictionId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedBets = bets.map(bet => ({
        ...bet,
        user_wallet_address: bet.user_wallet_address ? bet.user_wallet_address.slice(0, 8) + '...' : 'Anonymous',
      }));

      res.status(200).json({ status: 'success', bets: formattedBets });
    } catch (error) {
      console.error('Error fetching recent bets:', error);
      res.status(500).json({ status: 'error', message: 'Error fetching recent bets' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}