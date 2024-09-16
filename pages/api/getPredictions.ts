import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Fetch predictions
      const { data: predictions, error: predictionsError } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false });

      if (predictionsError) throw predictionsError;

      // Fetch bets for all predictions
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select('*');

      if (betsError) throw betsError;

      // Combine predictions with their bets
      const predictionsWithBets = predictions.map(prediction => ({
        ...prediction,
        bets: bets.filter(bet => bet.prediction_id === prediction.id)
      }));

      res.status(200).json({ status: 'success', predictions: predictionsWithBets });
    } catch (error: any) {
      console.error('Error fetching predictions:', error);
      res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch predictions' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}