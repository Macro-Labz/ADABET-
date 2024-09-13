import React, { useState, useEffect, ChangeEvent } from 'react';
import ShinyButton from './magicui/shiny-button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Bet {
  id: number;
  user: string;
  amount: number;
  type: 'yes' | 'no';
  timestamp: string;
}

interface Comment {
  id: number;
  user: string;
  text: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  memeUrl?: string;
  userVote?: 'up' | 'down' | null;
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
  onAddComment: (predictionId: number, commentContent: string) => void;
  onVoteComment: (predictionId: number, commentId: number, voteType: 'up' | 'down') => void;
  currentUser: string;
}

const PredictionDetails: React.FC<PredictionDetailsProps> = ({ 
  prediction, 
  onClose, 
  onBet, 
  onAddComment, 
  onVoteComment,
  currentUser
}) => {
  const [betAmount, setBetAmount] = useState('');
  const [chartData, setChartData] = useState<{ name: string; yes: number; no: number; }[]>([]); // Specify the type
  const [commentContent, setCommentContent] = useState('');
  const [memeUrl, setMemeUrl] = useState('');
  const [showMemeSelector, setShowMemeSelector] = useState(false);

  // Mock meme/GIF data (replace with actual API call in production)
  const memeOptions = [
    { url: 'https://example.com/meme1.gif', alt: 'Funny meme 1' },
    { url: 'https://example.com/meme2.gif', alt: 'Funny meme 2' },
    { url: 'https://example.com/meme3.gif', alt: 'Funny meme 3' },
    // Add more meme options here
  ];

  useEffect(() => {
    updateChartData();
  }, [prediction.yes_ada, prediction.no_ada]);

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
      return updatedData.slice(-10); // Keep only the last 10 data points
    });
  };

  const handleBet = (type: 'yes' | 'no') => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }
    onBet(prediction.id, type, amount);
    setBetAmount('');
    updateChartData();
  };

  const handleAddComment = () => {
    if (commentContent.trim()) {
      onAddComment(prediction.id, commentContent);
      setCommentContent('');
    }
  };

  const handleMemeSelect = (url: string) => {
    setMemeUrl(url);
    setShowMemeSelector(false);
  };

  const handleVote = (commentId: number, voteType: 'up' | 'down') => {
    onVoteComment(prediction.id, commentId, voteType);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl m-4 flex flex-col max-h-[90vh]">
        <div className="p-6 overflow-y-auto flex-grow">
          <h2 className="text-2xl font-bold mb-4">{prediction.title}</h2>
          <p className="mb-4">{prediction.content}</p>
          <p className="mb-2">End Date: {prediction.end_date}</p>
          <p className="mb-2">Yes: {prediction.yes_ada} ADA</p>
          <p className="mb-2">No: {prediction.no_ada} ADA</p>

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
                    {bet.user} bet {bet.amount} ADA on {bet.type} at {bet.timestamp}
                  </li>
                ))
              ) : (
                <li className="bg-gray-700 p-2 rounded">No bets yet</li>
              )}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Comments</h3>
            <div className="mb-4">
              <textarea
                value={commentContent}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCommentContent(e.target.value)}
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
            <ul className="space-y-4 max-h-60 overflow-y-auto">
              {prediction.comments && prediction.comments.length > 0 ? (
                prediction.comments.map((comment) => (
                  <li key={comment.id} className="bg-gray-700 p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{comment.user || 'Anonymous'}</p>
                        <p>{comment.text}</p>
                        {comment.memeUrl && (
                          <img src={comment.memeUrl} alt="Meme" className="mt-2 max-w-full h-auto" />
                        )}
                        <p className="text-sm text-gray-400 mt-2">{comment.timestamp}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleVote(comment.id, 'up')}
                          className={`text-green-500 hover:text-green-600 ${comment.userVote === 'up' ? 'font-bold' : ''}`}
                          disabled={comment.userVote === 'up'}
                        >
                          ▲ {comment.upvotes}
                        </button>
                        <button
                          onClick={() => handleVote(comment.id, 'down')}
                          className={`text-red-500 hover:text-red-600 ${comment.userVote === 'down' ? 'font-bold' : ''}`}
                          disabled={comment.userVote === 'down'}
                        >
                          ▼ {comment.downvotes}
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="bg-gray-700 p-4 rounded">No comments yet</li>
              )}
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