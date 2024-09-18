import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

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
      const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('prediction_id', predictionId.toString()) // Convert predictionId to string
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json({ status: 'success', comments });
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}