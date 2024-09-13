import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { walletAddress } = req.body;
    
    try {
      // Check if user already exists
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existingUser) {
        return res.status(200).json({ status: 'success', message: 'User already exists', walletAddress });
      }

      // Insert new user
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({ wallet_address: walletAddress });

      if (insertError) throw insertError;

      res.status(200).json({ status: 'success', message: 'User created', walletAddress });
    } catch (error: any) {
      console.error('Error in createUser API:', error);
      res.status(500).json({ status: 'error', message: error.message || 'Failed to create user' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}