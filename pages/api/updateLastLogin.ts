import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ status: 'error', message: 'Wallet address is required' });
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('wallet_address', walletAddress)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ status: 'success', data });
    } catch (error: any) {
      console.error('Error updating last login:', error);
      res.status(500).json({ status: 'error', message: error.message || 'Failed to update last login' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}