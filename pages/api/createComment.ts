import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { predictionId, userWalletAddress, content } = req.body;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          prediction_id: predictionId,
          user_wallet_address: userWalletAddress,
          content
        })
        .single();

      if (error) throw error;

      res.status(200).json({ status: 'success', data });
    } catch (error: any) {
      console.error('Error creating comment:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}