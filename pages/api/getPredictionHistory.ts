import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { predictionId } = req.query;

    try {
      const { data, error } = await supabase
        .from('prediction_history')
        .select('timestamp, yes_ada, no_ada')
        .eq('prediction_id', predictionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const history = data
        .map((row: any) => {
          const yesAda = parseFloat(row.yes_ada);
          const noAda = parseFloat(row.no_ada);
          
          if (isNaN(yesAda) || isNaN(noAda)) {
            console.error('Invalid data:', row);
            return null;
          }

          const value = calculatePercentageChance(yesAda, noAda);
          
          if (isNaN(value) || value < 0 || value > 100) {
            console.error('Invalid calculated value:', { yesAda, noAda, value });
            return null;
          }

          return {
            timestamp: new Date(row.timestamp).getTime(),
            value: parseFloat(value.toFixed(2))
          };
        })
        .filter((item: any) => item !== null);


      res.status(200).json({ history });
    } catch (error) {
      console.error('Error fetching prediction history:', error);
      res.status(500).json({ error: 'Failed to fetch prediction history' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function calculatePercentageChance(yesAda: number, noAda: number) {
  const total = yesAda + noAda;
  return total > 0 ? (yesAda / total * 100) : 50;
}