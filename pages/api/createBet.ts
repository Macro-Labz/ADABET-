import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { predictionId, userWalletAddress, amount, betType } = req.body;

    console.log('Creating bet with data:', { predictionId, userWalletAddress, amount, betType });

    try {
      // Start a Supabase transaction
      const { data, error } = await supabase.rpc('create_bet_and_update_prediction', {
        p_prediction_id: predictionId,
        p_user_wallet_address: userWalletAddress,
        p_amount: amount,
        p_bet_type: betType
      });

      if (error) throw error;

      console.log('New bet created:', data);

      // Fetch the complete bet data
      const { data: completeBetData, error: fetchError } = await supabase
        .from('bets')
        .select('*')
        .eq('id', data.id)
        .single();

      if (fetchError) throw fetchError;

      res.status(200).json({ status: 'success', data: completeBetData });
    } catch (error: any) {
      console.error('Error creating bet:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}