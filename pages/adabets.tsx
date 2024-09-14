'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import BetPopup from '../components/BetPopup';
import ShinyButton from '../components/magicui/shiny-button';
import { GridPattern } from '../components/magicui/animated-grid-pattern';
import CreatePredictionForm from '../components/CreatePredictionForm';
import PredictionDetails from '../components/PredictionDetails';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from "@meshsdk/react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, endOfDay, isPast } from 'date-fns';
import { AnimatedList } from '../components/magicui/animated-list';
import { useInterval } from '../hooks/useInterval'; // Create this custom hook
import { AnimatePresence, motion } from 'framer-motion';

// Update the Prediction interface
interface Prediction {
  id: number;
  title: string;
  content: string;
  yes_ada: number;
  no_ada: number;
  end_date: string;
  creator_wallet_address: string;
  created_at: string;
  bets: Bet[];
  comments: Comment[];
  color: string;
  tag?: string; // Make tag optional
}

// Update the Bet interface
interface Bet {
  id: number;
  prediction_id: number;
  user_wallet_address?: string; // Make this optional
  amount: number;
  bet_type: 'yes' | 'no';
  created_at: string;
}

// Update the Comment interface
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

interface UserBet extends Bet {
  prediction_title: string;
  prediction_tag?: string;
}

// Update this function in the AdaBetsPage component
const generateUniqueColor = (index: number) => {
  const hue = (index * 137.5) % 360; // Golden angle approximation
  return `hsl(${hue}, 85%, 35%)`; // Increased saturation, decreased lightness
};

interface Notification {
  message: string;
  type: 'success' | 'error';
}

const AdaBetsPage: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null); // Update type to allow Prediction or null
  const [currentUser, setCurrentUser] = useState('User1'); // Simulating a logged-in user
  const router = useRouter();
  const { connected, wallet } = useWallet();
  const [newBetId, setNewBetId] = useState<number | null>(null);
  const [latestUserBets, setLatestUserBets] = useState<UserBet[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);
  const isSubmittingRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchPredictions();
    fetchLatestUserBets();
  }, []);

  // Add polling for latest bets
  useInterval(() => {
    fetchLatestUserBets();
  }, 30000); // Poll every 30 seconds

  const fetchPredictions = async () => {
    try {
      const response = await fetch('/api/getPredictions');
      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }
      const data = await response.json();
      setPredictions(data.predictions.map((pred: Prediction) => ({
        ...pred,
        color: generateUniqueColor(pred.id),
        yesAda: pred.yes_ada,
        noAda: pred.no_ada,
        endDate: pred.end_date,
      })).sort((a: Prediction, b: Prediction) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const fetchLatestUserBets = async () => {
    try {
      const response = await fetch('/api/getLatestBets');
      if (!response.ok) {
        throw new Error('Failed to fetch latest bets');
      }
      const data = await response.json();
      setLatestUserBets(data.bets);
    } catch (error) {
      console.error('Error fetching latest bets:', error);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 7000); // Clear notification after 7 seconds
  };

  const handleBet = async (predictionId: number, betType: 'yes' | 'no', amount: number) => {
    if (!connected || !wallet) {
      showNotification("Please connect your wallet to place a bet.", 'error');
      return;
    }

    if (isSubmittingRef.current) {
      console.log('Bet submission already in progress');
      return;
    }

    isSubmittingRef.current = true;

    try {
      const walletAddress = await wallet.getChangeAddress();

      // Call the API to create the bet
      const response = await fetch('/api/createBet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          predictionId,
          userWalletAddress: walletAddress,
          amount,
          betType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place bet');
      }

      const { data } = await response.json();

      // Update the local state with the new bet
      setPredictions(predictions.map(pred => {
        if (pred.id === predictionId) {
          return {
            ...pred,
            yes_ada: betType === 'yes' ? pred.yes_ada + amount : pred.yes_ada,
            no_ada: betType === 'no' ? pred.no_ada + amount : pred.no_ada,
            bets: [data, ...pred.bets],
          };
        }
        return pred;
      }));

      setNewBetId(data.id);
      setTimeout(() => setNewBetId(null), 5000); // Clear new bet highlight after 5 seconds

      if (selectedPrediction && selectedPrediction.id === predictionId) {
        setSelectedPrediction(prev => ({
          ...prev!,
          yes_ada: betType === 'yes' ? prev!.yes_ada + amount : prev!.yes_ada,
          no_ada: betType === 'no' ? prev!.no_ada + amount : prev!.no_ada,
          bets: [data, ...prev!.bets],
        }));
      }

      // Immediately add the new bet to latestUserBets
      const newBet: UserBet = {
        ...data,
        prediction_title: predictions.find(p => p.id === predictionId)?.title || '',
        prediction_tag: predictions.find(p => p.id === predictionId)?.tag || '',
      };
      setLatestUserBets(prevBets => [newBet, ...prevBets.slice(0, 9)]);

      // Get the prediction title
      const predictionTitle = predictions.find(p => p.id === predictionId)?.title || 'Unknown Prediction';

      // Create a more detailed success message
      const successMessage = `Bet placed successfully!
        Prediction: ${predictionTitle}
        Amount: ${amount} ADA
        Position: ${betType.toUpperCase()}
        Transaction ID: ${data.id}`;

      showNotification(successMessage, 'success');
    } catch (error: unknown) {
      console.error('Error placing bet:', error);
      showNotification(error instanceof Error ? error.message : 'Failed to place bet. Please try again.', 'error');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleCreateBet = () => {
    if (connected) {
      setShowCreateForm(true);
    } else {
      alert('Please connect your wallet to create a bet.');
    }
  };

  const handleNewPrediction = (newPrediction: Prediction) => {
    console.log('New prediction received:', newPrediction);
    setPredictions([
      {
        ...newPrediction,
        color: generateUniqueColor(newPrediction.id),
        bets: [],
      },
      ...predictions
    ]);
    setShowCreateForm(false);
  };

  const calculatePercentageChance = (yesAda: number, noAda: number) => {
    const total = yesAda + noAda;
    return total > 0 ? (yesAda / total * 100) : 50;
  };

  const handlePredictionClick = (prediction: Prediction) => {
    setSelectedPrediction(prediction);
  };

  const handleAddComment = async (predictionId: number, commentContent: string) => {
    if (!wallet) {
      console.error('Wallet not connected');
      return;
    }

    try {
      const walletAddress = await wallet.getChangeAddress();
      const response = await fetch('/api/createComment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          predictionId,
          userWalletAddress: walletAddress,
          content: commentContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await response.json();
      
      setPredictions(predictions.map(pred => {
        if (pred.id === predictionId) {
          const updatedPrediction = {
            ...pred,
            comments: [data.data, ...pred.comments],
          };
          if (selectedPrediction && selectedPrediction.id === predictionId) {
            setSelectedPrediction(updatedPrediction);
          }
          return updatedPrediction;
        }
        return pred;
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleClosePredictionDetails = () => {
    setSelectedPrediction(null);
  };

  const generateChartData = (prediction: Prediction) => {
    // This is a placeholder. In a real scenario, you'd use historical data.
    return [
      { time: '1d', value: 50 },
      { time: '2d', value: 55 },
      { time: '3d', value: 52 },
      { time: '4d', value: 58 },
      { time: '5d', value: parseFloat(calculatePercentageChance(prediction.yes_ada, prediction.no_ada).toFixed(2)) },
    ];
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 50) {
      // Green gradient from 50% to 100%
      const intensity = Math.round(((percentage - 50) / 50) * 255);
      return `rgb(0, ${intensity}, 0)`;
    } else {
      // Red gradient from 0% to 50%
      const intensity = Math.round(((50 - percentage) / 50) * 255);
      return `rgb(${intensity}, 0, 0)`;
    }
  };

  const getTimeToEnding = (endDate: string) => {
    const now = new Date();
    const end = endOfDay(new Date(endDate));
    const daysLeft = differenceInDays(end, now);
    const hoursLeft = differenceInHours(end, now) % 24;
    const minutesLeft = differenceInMinutes(end, now) % 60;
    const secondsLeft = differenceInSeconds(end, now) % 60;

    if (daysLeft > 1) {
      return `${daysLeft}d ${hoursLeft}h left`;
    } else if (daysLeft === 1) {
      return `1d ${hoursLeft}h left`;
    } else if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m ${secondsLeft}s left`;
    } else if (minutesLeft > 0) {
      return `${minutesLeft}m ${secondsLeft}s left`;
    } else if (secondsLeft > 0) {
      return `${secondsLeft}s left`;
    } else {
      return 'Ended';
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag === selectedTag ? null : tag);
  };

  const handleClearFilter = () => {
    setSelectedTag(null);
    setSearchTerm('');
  };

  const filteredPredictions = predictions.filter(prediction =>
    (selectedTag ? prediction.tag === selectedTag : true) &&
    (prediction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prediction.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prediction.tag && prediction.tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const sortedPredictions = filteredPredictions.sort((a, b) => {
    if (selectedTag === 'Top') {
      return (b.yes_ada + b.no_ada) - (a.yes_ada + a.no_ada);
    } else if (selectedTag === 'New') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#000033] text-white relative">
      <GridPattern
        width={40}
        height={40}
        className="absolute inset-0 w-full h-full"
        numSquares={100}
        maxOpacity={0.3}
        duration={5}
      />
      <div className="relative z-10 flex">
        <div className="flex-grow">
          <Header 
            borderThickness={1} 
            onSearch={handleSearch} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
          />
          <div className="sticky top-0 z-10 bg-[#000033] shadow-md">
            <div className="flex justify-between items-center py-2 px-4 border-b border-gray-700">
              <div className="flex overflow-x-auto space-x-2 items-center">
                {['Top', 'New', 'Crypto Prices', 'Bitcoin', 'Airdrops', 'Ethereum', 'Memecoins', 'Stablecoins', 'Cardano', 'Opinion', 'Price'].map((tag) => (
                  <button
                    key={tag}
                    className={`px-3 py-1 rounded-full whitespace-nowrap text-xs ${
                      selectedTag === tag ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                  </button>
                ))}
                {(selectedTag || searchTerm) && (
                  <button
                    className="px-3 py-1 rounded-full whitespace-nowrap text-xs bg-red-500 hover:bg-red-600"
                    onClick={handleClearFilter}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              {router.pathname === '/adabets' && (
                <ShinyButton
                  text="Create Bet"
                  color={connected ? "rgb(59, 130, 246)" : "rgb(156, 163, 175)"}
                  onClick={handleCreateBet}
                  className={`px-4 py-2 rounded ${
                    connected
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-500 cursor-not-allowed"
                  }`}
                />
              )}
            </div>
          </div>
          <div className="container mx-auto px-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedPredictions.map((prediction) => {
                const percentageChance = calculatePercentageChance(prediction.yes_ada, prediction.no_ada);
                const progressColor = getProgressColor(percentageChance);
                const timeToEnding = getTimeToEnding(prediction.end_date);
                const daysLeft = differenceInDays(endOfDay(new Date(prediction.end_date)), new Date());
                const isEnded = isPast(endOfDay(new Date(prediction.end_date)));
                return (
                  <div 
                    key={prediction.id} 
                    className={`bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer ${isEnded ? 'opacity-75' : ''} ${prediction.id === newBetId ? 'animate-slide-in' : ''}`}
                    onClick={() => handlePredictionClick(prediction)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-3/4">
                        <h3 className="text-lg font-semibold">{prediction.title}</h3>
                        {prediction.tag && (
                          <span className="inline-block bg-blue-500 text-xs font-semibold px-2 py-1 rounded-full mt-1">
                            {prediction.tag}
                          </span>
                        )}
                      </div>
                      <div className="w-1/4 max-w-[80px]">
                        <CircularProgressbar
                          value={percentageChance}
                          text={`${percentageChance.toFixed(0)}%`}
                          styles={buildStyles({
                            textSize: '22px',
                            pathColor: progressColor,
                            textColor: 'white',
                            trailColor: '#d6d6d6',
                          })}
                        />
                      </div>
                    </div>
                    <p className="mb-2 text-sm text-gray-400">{prediction.content}</p>
                    <div className="h-20 mb-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={generateChartData(prediction)}>
                          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-green-500">Yes: {prediction.yes_ada.toFixed(2)} ADA</span>
                      <span className="text-red-500">No: {prediction.no_ada.toFixed(2)} ADA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Volume: {(prediction.yes_ada + prediction.no_ada).toFixed(2)} ADA</span>
                      <span className={`${isEnded ? 'text-red-500 font-bold' : daysLeft <= 1 ? 'text-red-500 font-bold' : 'text-yellow-500'}`}>
                        {isEnded ? 'Ended' : timeToEnding}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {showPopup && <BetPopup onClose={() => setShowPopup(false)} />}
          {showCreateForm && (
            <CreatePredictionForm
              onClose={() => setShowCreateForm(false)}
              onSubmit={handleNewPrediction}
            />
          )}
          {selectedPrediction && (
            <PredictionDetails
              prediction={selectedPrediction}
              onClose={handleClosePredictionDetails}
              onBet={handleBet}
              wallet={wallet}
              connected={connected}
            />
          )}
        </div>
        <div className="w-64 bg-gray-900 p-4 overflow-y-auto h-screen sticky top-0">
          <h2 className="text-xl font-bold mb-4">Latest Bets</h2>
          <AnimatedList delay={2000}>
            {latestUserBets.map((bet) => (
              <div 
                key={bet.id} 
                className={`p-2 rounded mb-2 ${
                  bet.bet_type === 'yes' ? 'bg-green-800' : 'bg-red-800'
                }`}
              >
                <p className="text-sm font-semibold">{bet.prediction_title}</p>
                {bet.prediction_tag && (
                  <span className="inline-block bg-blue-500 text-xs font-semibold px-2 py-1 rounded-full mt-1 mb-1">
                    {bet.prediction_tag}
                  </span>
                )}
                <p className="text-xs text-gray-300">
                  {bet.bet_type.toUpperCase()} - {bet.amount} ADA
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(bet.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </AnimatedList>
        </div>
      </div>
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-5 right-5 p-4 rounded-md shadow-lg z-50 ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {notification.message.split('\n').map((line, index) => (
              <p key={index} className="whitespace-pre-line">{line}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdaBetsPage;