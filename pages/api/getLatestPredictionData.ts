import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { predictionId } = req.query;

  if (!predictionId || typeof predictionId !== 'string') {
    return res.status(400).json({ message: 'Invalid prediction ID' });
  }

  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('yes_ada, no_ada')
      .eq('id', predictionId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: 'Prediction not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching latest prediction data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
