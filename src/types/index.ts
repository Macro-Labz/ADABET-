export interface Comment {
  id: number;
  user: string;
  text: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  memeUrl?: string;
  userVote?: 'up' | 'down' | null;
}