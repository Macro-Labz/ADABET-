import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Label } from 'recharts';
import ShinyButton from './magicui/shiny-button';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, parseISO, format } from 'date-fns';

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
    created_at: string;
  };
  onClose: () => void;
  onBet: (predictionId: number, betType: 'yes' | 'no', amount: number) => void;
  wallet: any;
  connected: boolean;
}

interface ChartDataPoint {
  timestamp: number;
  value: number;
}

// Add this to your CSS (you can put it in a separate file and import it)
const styles = `
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.new-bet-animation {
  animation: slideIn 0.5s ease-out;
}
`;

const PredictionDetails: React.FC<PredictionDetailsProps> = ({ 
  prediction, 
  onClose, 
  onBet,
  wallet,
  connected
}) => {
  const [betAmount, setBetAmount] = useState('');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [memeUrl, setMemeUrl] = useState('');
  const [showMemeSelector, setShowMemeSelector] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [newBetId, setNewBetId] = useState<number | null>(null);
  const [recentBets, setRecentBets] = useState<Bet[]>([]);

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
    fetchPredictionHistory();
    fetchRecentBets();

    // Set up polling to update the chart and recent bets every 30 seconds
    const intervalId = setInterval(() => {
      fetchPredictionHistory();
      fetchRecentBets();
    }, 30000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [prediction.id]);

  const fetchPredictionHistory = async () => {
    try {
      const response = await fetch(`/api/getPredictionHistory?predictionId=${prediction.id}`);
      if (!response.ok) throw new Error('Failed to fetch prediction history');
      const data = await response.json();
      
      // Validate and filter out any invalid data points
      const validChartData = data.history
        .filter((point: ChartDataPoint) => 
          !isNaN(point.value) && 
          !isNaN(new Date(point.timestamp).getTime()) &&
          point.value >= 0 && 
          point.value <= 100
        )
        .map((point: ChartDataPoint) => ({
          ...point,
          value: parseFloat(point.value.toFixed(2)) // Ensure value is a number with 2 decimal places
        }));

      console.log('Filtered chart data:', validChartData);
      setChartData(validChartData);
    } catch (error) {
      console.error('Error fetching prediction history:', error);
    }
  };

  const fetchRecentBets = async () => {
    try {
      const response = await fetch(`/api/getRecentBets?predictionId=${prediction.id}`);
      if (!response.ok) throw new Error('Failed to fetch recent bets');
      const data = await response.json();
      setRecentBets(data.bets);
    } catch (error) {
      console.error('Error fetching recent bets:', error);
    }
  };

  const calculatePercentageChance = (yesAda: number, noAda: number) => {
    const total = yesAda + noAda;
    return total > 0 ? (yesAda / total * 100) : 50;
  };

  useEffect(() => {
    fetchComments();
  }, [prediction.id]);

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
      setNewBetId(data.data.id);
      setTimeout(() => setNewBetId(null), 5000); // Clear new bet highlight after 5 seconds
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

  const getTimeToEnding = (endDate: string) => {
    const now = new Date();
    const end = parseISO(endDate);
  
    const daysLeft = differenceInDays(end, now);
    const hoursLeft = differenceInHours(end, now) % 24;
    const minutesLeft = differenceInMinutes(end, now) % 60;
    const secondsLeft = differenceInSeconds(end, now) % 60;

    if (daysLeft > 1) {
      return `${daysLeft}d ${hoursLeft}h left`;
    } else if (daysLeft === 1) {
      return `1d ${hoursLeft}h left`;
    } else if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m left`;
    } else if (minutesLeft > 0) {
      return `${minutesLeft}m ${secondsLeft}s left`;
    } else if (secondsLeft > 0) {
      return `${secondsLeft}s left`;
    } else {
      return 'Ended';
    }
  };

  useEffect(() => {
    const updateTimeRemaining = () => {
      setTimeRemaining(getTimeToEnding(prediction.end_date));
    };

    // Update immediately and then every second
    updateTimeRemaining();
    const intervalId = setInterval(updateTimeRemaining, 1000);

    // Clear the interval when the component unmounts or when the prediction changes
    return () => clearInterval(intervalId);
  }, [prediction.end_date]);

  const isEnded = parseISO(prediction.end_date) < new Date();

  const getBetSummary = () => {
    const totalBets = prediction.yes_ada + prediction.no_ada;
    const yesPercentage = (prediction.yes_ada / totalBets) * 100;
    const noPercentage = (prediction.no_ada / totalBets) * 100;
    return (
      <div className="bg-gray-700 p-4 rounded mb-4">
        <h3 className="text-xl font-semibold mb-2">Bet Summary</h3>
        <p>Total bets: {totalBets.toFixed(2)} ADA</p>
        <p>Yes: {prediction.yes_ada.toFixed(2)} ADA ({yesPercentage.toFixed(2)}%)</p>
        <p>No: {prediction.no_ada.toFixed(2)} ADA ({noPercentage.toFixed(2)}%)</p>
        <p>Winner: {yesPercentage > noPercentage ? 'Yes' : 'No'}</p>
      </div>
    );
  };

  const generateChartData = (bets: Bet[]) => {
    if (bets.length === 0) {
      // If no bets, return a flat line at 50%
      return [
        { timestamp: new Date(prediction.created_at).getTime(), value: 50 },
        { timestamp: new Date().getTime(), value: 50 }
      ];
    }

    // Sort bets by timestamp
    const sortedBets = [...bets].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    let yesTotal = 0;
    let noTotal = 0;
    
    return sortedBets.map(bet => {
      if (bet.bet_type === 'yes') {
        yesTotal += bet.amount;
      } else {
        noTotal += bet.amount;
      }
      const total = yesTotal + noTotal;
      const yesPercentage = total > 0 ? (yesTotal / total) * 100 : 50;
      
      return {
        timestamp: new Date(bet.created_at).getTime(),
        value: yesPercentage
      };
    });
  };

  useEffect(() => {
    const data = generateChartData(prediction.bets);
    setChartData(data);
  }, [prediction.bets]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <style>{styles}</style>
      <div ref={detailsRef} className="bg-gray-800 rounded-lg w-full max-w-4xl m-4 flex flex-col max-h-[90vh]">
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{prediction.title}</h2>
            <div className="text-right">
              <span className="text-3xl font-bold text-green-500">{calculatePercentageChance(prediction.yes_ada, prediction.no_ada).toFixed(2)}%</span>
              <p className={`${differenceInDays(parseISO(prediction.end_date), new Date()) <= 1 ? 'text-red-500 font-bold' : 'text-yellow-500'}`}>
                {timeRemaining}
              </p>
            </div>
          </div>
          <p className="mb-4 text-gray-400">{prediction.content}</p>
          
          <div className="mb-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData} 
                style={{ backgroundColor: 'black' }}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(tick) => format(new Date(tick), 'MM/dd HH:mm')}
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fill: '#888888' }}
                  axisLine={{ stroke: '#333333' }}
                >
                  <Label 
                    value="Time" 
                    position="bottom" 
                    offset={10}
                    style={{ fill: '#888888' }}
                  />
                </XAxis>
                <YAxis 
                  domain={[0, 100]} 
                  allowDataOverflow={true}
                  tick={{ fill: '#888888' }}
                  axisLine={{ stroke: '#333333' }}
                >
                  <Label 
                    value="% Odds" 
                    angle={-90} 
                    position="insideLeft" 
                    style={{ textAnchor: 'middle', fill: '#888888' }}
                  />
                </YAxis>
                <Tooltip 
                  labelFormatter={(label) => format(new Date(label), 'yyyy-MM-dd HH:mm:ss')}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, 'Probability']}
                  contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }}
                  labelStyle={{ color: '#888888' }}
                />
                <Line 
                  type="stepAfter"
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2} 
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-900 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">Yes</h3>
              <p className="text-2xl font-bold">{prediction.yes_ada} ADA</p>
            </div>
            <div className="bg-red-900 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">No</h3>
              <p className="text-2xl font-bold">{prediction.no_ada} ADA</p>
            </div>
          </div>

          {isEnded ? (
            getBetSummary()
          ) : connected ? (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Place Your Bet</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter ADA amount"
                  className="px-3 py-2 bg-gray-700 rounded flex-grow"
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
            <h3 className="text-xl font-semibold mb-2">Recent Bets</h3>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {recentBets.length > 0 ? (
                recentBets.map((bet) => (
                  <li 
                    key={bet.id} 
                    className={`p-2 rounded ${
                      bet.bet_type === 'yes' ? 'bg-green-800' : 'bg-red-800'
                    } ${bet.id === newBetId ? 'new-bet-animation' : ''}`}
                  >
                    <span className="font-medium">
                      {bet.user_wallet_address ? bet.user_wallet_address.slice(0, 8) + '...' : 'Anonymous'}
                    </span>{' '}
                    bet {bet.amount} ADA on {bet.bet_type} at {
                      new Date(bet.created_at).toLocaleString()
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