import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import ShinyButton from './magicui/shiny-button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Bet {
  id: number;
  prediction_id: number;
  user_wallet_address?: string;
  amount: number;
  bet_type: 'yes' | 'no';
  created_at: string;
}

interface Comment {
  id: number;
  prediction_id: number;
  user_wallet_address: string;
  content: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  voters: { [key: string]: 'up' | 'down' };
}

interface PredictionDetailsProps {
  prediction: {
    id: number;
    title: string;
    content: string;
    yes_ada: number;
    no_ada: number;
    end_date: string;
    bets: Bet[];
    comments: Comment[];
  };
  onClose: () => void;
  onBet: (predictionId: number, betType: 'yes' | 'no', amount: number) => void;
  wallet: any;
  connected: boolean;
}

const PredictionDetails: React.FC<PredictionDetailsProps> = ({ 
  prediction, 
  onClose, 
  onBet,
  wallet,
  connected
}) => {
  const [betAmount, setBetAmount] = useState('');
  const [chartData, setChartData] = useState<{ name: string; yes: number; no: number; }[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [memeUrl, setMemeUrl] = useState('');
  const [showMemeSelector, setShowMemeSelector] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  const memeOptions = [
    { url: 'https://example.com/meme1.gif', alt: 'Funny meme 1' },
    { url: 'https://example.com/meme2.gif', alt: 'Funny meme 2' },
    { url: 'https://example.com/meme3.gif', alt: 'Funny meme 3' },
  ];

  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    updateChartData();
  }, [prediction.yes_ada, prediction.no_ada]);

  useEffect(() => {
    console.log('Prediction bets:', prediction.bets);
  }, [prediction.bets]);

  useEffect(() => {
    fetchComments();
  }, [prediction.id]);

  const updateChartData = () => {
    const totalAda = prediction.yes_ada + prediction.no_ada;
    const yesRatio = totalAda > 0 ? prediction.yes_ada / totalAda : 0.5;
    const noRatio = totalAda > 0 ? prediction.no_ada / totalAda : 0.5;

    const newDataPoint = {
      name: new Date().toLocaleTimeString(),
      yes: yesRatio,
      no: noRatio,
    };

    setChartData(prevData => {
      const updatedData = [...prevData, newDataPoint];
      return updatedData.slice(-10);
    });
  };

  const handleBet = async (type: 'yes' | 'no') => {
    if (!connected) {
      alert('Please connect your wallet to place a bet.');
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }

    try {
      const walletAddress = await wallet.getChangeAddress();
      const response = await fetch('/api/createBet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          predictionId: prediction.id,
          userWalletAddress: walletAddress,
          amount,
          betType: type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place bet');
      }

      const data = await response.json();
      onBet(prediction.id, type, amount);
      setBetAmount('');
      updateChartData();
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet. Please try again.');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/getComments?predictionId=${prediction.id.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!connected) {
      alert('Please connect your wallet to add a comment.');
      return;
    }

    if (!commentContent.trim()) return;

    try {
      const walletAddress = await wallet.getChangeAddress();
      const response = await fetch('/api/createComment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predictionId: prediction.id,
          userWalletAddress: walletAddress,
          content: commentContent
        }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      setCommentContent('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleMemeSelect = (url: string) => {
    setMemeUrl(url);
    setShowMemeSelector(false);
  };

  const handleVote = async (commentId: number, voteType: 'up' | 'down') => {
    if (!connected) {
      alert('Please connect your wallet to vote on comments.');
      return;
    }

    try {
      const walletAddress = await wallet.getChangeAddress();
      const response = await fetch('/api/voteComment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId, voteType, userWalletAddress: walletAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to vote on comment');
      }

      // Update the local state with the new vote count
      setComments(comments.map(comment => 
        comment.id === commentId ? { ...comment, ...data.data } : comment
      ));
    } catch (error: any) {
      console.error('Error voting on comment:', error);
      alert(error.message || 'Failed to vote on comment');
    }
  };

  const getUserVote = (comment: Comment) => {
    if (!connected || !wallet) return null;
    return comment.voters?.[wallet.getChangeAddress()] || null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={detailsRef} className="bg-gray-800 rounded-lg w-full max-w-4xl m-4 flex flex-col max-h-[90vh]">
        <div className="p-6 overflow-y-auto flex-grow">
          <h2 className="text-2xl font-bold mb-4">{prediction.title}</h2>
          <p className="mb-4">{prediction.content}</p>
          <p className="mb-2">End Date: {prediction.end_date}</p>
          <p className="mb-2">Yes: {prediction.yes_ada} ADA</p>
          <p className="mb-2">No: {prediction.no_ada} ADA</p>

          {connected ? (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Place Your Bet</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter ADA amount"
                  className="px-3 py-2 bg-gray-700 rounded"
                />
                <ShinyButton
                  text="Bet Yes"
                  color="rgb(34, 197, 94)"
                  onClick={() => handleBet('yes')}
                  className="px-4 py-2 bg-green-500 rounded hover:bg-green-600"
                />
                <ShinyButton
                  text="Bet No"
                  color="rgb(239, 68, 68)"
                  onClick={() => handleBet('no')}
                  className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
                />
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-yellow-500">Connect your wallet to place bets and comment.</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Market Prediction Chart</h3>
            <LineChart width={600} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="yes" stroke="#8884d8" />
              <Line type="monotone" dataKey="no" stroke="#82ca9d" />
            </LineChart>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Recent Bets</h3>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {prediction.bets && prediction.bets.length > 0 ? (
                prediction.bets.map((bet) => (
                  <li key={bet.id} className="bg-gray-700 p-2 rounded">
                    {bet.user_wallet_address 
                      ? `${bet.user_wallet_address.slice(0, 8)}...` 
                      : 'Anonymous'} bet {bet.amount} ADA on {bet.bet_type} at {
                        bet.created_at 
                          ? new Date(bet.created_at).toLocaleString()
                          : 'Invalid Date'
                    }
                  </li>
                ))
              ) : (
                <li className="bg-gray-700 p-2 rounded">No bets yet</li>
              )}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Comments</h3>
            {connected ? (
              <div className="mb-4">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 bg-gray-700 rounded"
                  rows={3}
                />
                <div className="flex items-center mt-2">
                  <input
                    type="text"
                    value={memeUrl}
                    onChange={(e) => setMemeUrl(e.target.value)}
                    placeholder="Add a meme/gif URL (optional)"
                    className="flex-grow px-3 py-2 bg-gray-700 rounded-l"
                  />
                  <ShinyButton
                    text="📷 Memes"
                    color="rgb(59, 130, 246)"
                    onClick={() => setShowMemeSelector(!showMemeSelector)}
                    className="px-4 py-2 bg-blue-500 rounded-r hover:bg-blue-600"
                  />
                </div>
                {showMemeSelector && (
                  <div className="mt-2 grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {memeOptions.map((meme, index) => (
                      <img
                        key={index}
                        src={meme.url}
                        alt={meme.alt}
                        className="w-full h-24 object-cover cursor-pointer rounded"
                        onClick={() => handleMemeSelect(meme.url)}
                      />
                    ))}
                  </div>
                )}
                <ShinyButton
                  text="Add Comment"
                  color="rgb(59, 130, 246)"
                  onClick={handleAddComment}
                  className="mt-2 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                />
              </div>
            ) : (
              <p className="text-yellow-500 mb-4">Connect your wallet to add comments.</p>
            )}
            <ul className="space-y-4 max-h-60 overflow-y-auto">
              {comments.map((comment) => {
                const userVote = getUserVote(comment);
                return (
                  <li key={comment.id} className="bg-gray-700 p-4 rounded">
                    <p className="font-semibold">{comment.user_wallet_address.slice(0, 8)}...</p>
                    <p>{comment.content}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                    {connected && (
                      <div className="flex items-center space-x-2 mt-2">
                        <button 
                          className={`text-green-500 hover:text-green-400 ${userVote === 'up' ? 'font-bold' : ''}`}
                          onClick={() => handleVote(comment.id, 'up')}
                        >
                          ▲ {comment.upvotes}
                        </button>
                        <button 
                          className={`text-red-500 hover:text-red-400 ${userVote === 'down' ? 'font-bold' : ''}`}
                          onClick={() => handleVote(comment.id, 'down')}
                        >
                          ▼ {comment.downvotes}
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700">
          <ShinyButton
            text="Close"
            color="rgb(239, 68, 68)"
            onClick={onClose}
            className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
          />
        </div>
      </div>
    </div>
  );
};

export default PredictionDetails;