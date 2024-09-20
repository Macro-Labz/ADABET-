import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data: bets, error } = await supabase
        .from('bets')
        .select(`
          id,
          prediction_id,
          user_wallet_address,
          amount,
          bet_type,
          created_at,
          predictions (
            id,
            title,
            tag
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedBets = bets.map(bet => ({
        ...bet,
        prediction_title: bet.predictions[0]?.title,
        prediction_tag: bet.predictions[0]?.tag
      }));

      res.status(200).json({ bets: formattedBets });
    } catch (error: any) {
      console.error('Error in getLatestBets API:', error);
      res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch latest bets' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}