import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a simple in-memory cache to store recent bets
const recentBets = new Map<string, number>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { predictionId, userWalletAddress, amount, betType } = req.body;

    console.log('Received bet request:', { predictionId, userWalletAddress, amount, betType });

    try {
      // Create a new bet
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

      // Fetch the newly created bet
      const { data: newBet, error: fetchError } = await supabase
        .from('bets')
        .select('*')
        .eq('prediction_id', predictionId)
        .eq('user_wallet_address', userWalletAddress)
        .eq('amount', amount)
        .eq('bet_type', betType)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        console.error('Error fetching new bet:', fetchError);
        throw fetchError;
      }

      console.log('New bet created:', newBet);

      // Fetch the updated prediction data
      const { data: updatedPrediction, error: predictionError } = await supabase
        .from('predictions')
        .select('yes_ada, no_ada')
        .eq('id', predictionId)
        .single();

      if (predictionError) {
        console.error('Error fetching updated prediction:', predictionError);
        throw predictionError;
      }

      // Add a new entry to the prediction_history table
      const { error: historyError } = await supabase
        .from('prediction_history')
        .insert({
          prediction_id: predictionId,
          yes_ada: updatedPrediction.yes_ada,
          no_ada: updatedPrediction.no_ada,
          timestamp: new Date().toISOString()
        });

      if (historyError) {
        console.error('Error updating prediction history:', historyError);
        throw historyError;
      }

      console.log('New bet created and history updated successfully:', newBet);
      res.status(200).json({ status: 'success', data: newBet });
    } catch (error: any) {
      console.error('Error creating bet:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}