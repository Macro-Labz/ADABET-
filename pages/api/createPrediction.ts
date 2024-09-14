import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { endOfDay } from 'date-fns';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, content, endDate, initialStake, creatorWalletAddress } = req.body;

    try {
      const { data: newPrediction, error } = await supabase
        .from('predictions')
        .insert({
          title,
          content,
          end_date: endOfDay(new Date(endDate)).toISOString(),
          initial_stake: initialStake,
          creator_wallet_address: creatorWalletAddress,
          yes_ada: initialStake,
          no_ada: 0,
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`New prediction created: ${newPrediction.id}`);
      res.status(201).json({ status: 'success', message: 'Prediction created', prediction: newPrediction });
    } catch (error: any) {
      console.error('Error in createPrediction API:', error);
      res.status(500).json({ status: 'error', message: error.message || 'Failed to create prediction' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}