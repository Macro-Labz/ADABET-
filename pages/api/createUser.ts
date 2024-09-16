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

      const now = new Date().toISOString();

      if (existingUser) {
        // Update last login for existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ last_login: now })
          .eq('wallet_address', walletAddress)
          .select()
          .single();

        if (updateError) throw updateError;

        console.log(`Returning user with address: ${walletAddress}`);
        return res.status(200).json({ status: 'success', message: 'User login updated', user: updatedUser });
      } else {
        // Insert new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({ wallet_address: walletAddress, last_login: now })
          .select()
          .single();

        if (insertError) throw insertError;

        console.log(`New user created with address: ${walletAddress}`);
        res.status(201).json({ status: 'success', message: 'User created', user: newUser });
      }
    } catch (error: any) {
      console.error('Error in createUser API:', error);
      res.status(500).json({ status: 'error', message: error.message || 'Failed to create or update user' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}