import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { commentId, voteType, userWalletAddress } = req.body;

    try {
      // Fetch the current comment data
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('id', commentId)
        .single();

      if (fetchError) throw fetchError;

      // Check if the user has already voted
      const voters = comment.voters || {};
      const previousVote = voters[userWalletAddress];

      let updatedUpvotes = comment.upvotes;
      let updatedDownvotes = comment.downvotes;

      if (previousVote) {
        // Remove the previous vote
        if (previousVote === 'up') updatedUpvotes--;
        if (previousVote === 'down') updatedDownvotes--;
      }

      // Add the new vote
      if (voteType === 'up') updatedUpvotes++;
      if (voteType === 'down') updatedDownvotes++;

      // Update the vote count and add/update the user's vote
      const updatedVoters = { ...voters, [userWalletAddress]: voteType };
      const { data, error } = await supabase
        .from('comments')
        .update({
          upvotes: updatedUpvotes,
          downvotes: updatedDownvotes,
          voters: updatedVoters
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ status: 'success', data });
    } catch (error: any) {
      console.error('Error voting on comment:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}