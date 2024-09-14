import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { predictionId, userWalletAddress, amount, betType } = req.body;

    console.log('Received bet request:', { predictionId, userWalletAddress, amount, betType });

    try {
      // Check if a bet already exists
      const { data: existingBet, error: checkError } = await supabase
        .from('bets')
        .select('id')
        .eq('prediction_id', predictionId)
        .eq('user_wallet_address', userWalletAddress)
        .eq('amount', amount)
        .eq('bet_type', betType)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingBet) {
        console.log('Bet already exists:', existingBet);
        return res.status(200).json({ status: 'success', data: existingBet, message: 'Bet already exists' });
      }

      // If no existing bet, create a new one
      const { data, error } = await supabase.rpc('create_bet_and_update_prediction', {
        p_prediction_id: predictionId,
        p_user_wallet_address: userWalletAddress,
        p_amount: amount,
        p_bet_type: betType
      });

      if (error) {
        console.error('Error in create_bet_and_update_prediction:', error);
        throw error;
      }

      console.log('Bet created successfully:', data);
      res.status(200).json({ status: 'success', data });
    } catch (error: any) {
      console.error('Error creating bet:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}