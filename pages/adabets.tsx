'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BetPopup from '../components/BetPopup';
import ShinyButton from '../components/magicui/shiny-button';
import { GridPattern } from '../components/magicui/animated-grid-pattern';
import CreateBetForm from '../components/CreateBetForm';
import PredictionDetails from '../components/PredictionDetails';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from "@meshsdk/react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, endOfDay, isPast } from 'date-fns';

// Update the Prediction interface
interface Prediction {
  id: number;
  title: string;
  content: string;
  yes_ada: number;
  no_ada: number;
  end_date: string;
  initial_stake: number;
  creator_wallet_address: string;
  created_at: string;
  bets: Bet[];
  comments: Comment[];
  color: string;
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
}

// Update this function in the AdaBetsPage component
const generateUniqueColor = (index: number) => {
  const hue = (index * 137.5) % 360; // Golden angle approximation
  return `hsl(${hue}, 85%, 35%)`; // Increased saturation, decreased lightness
};

const AdaBetsPage: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null); // Update type to allow Prediction or null
  const [currentUser, setCurrentUser] = useState('User1'); // Simulating a logged-in user
  const router = useRouter();
  const { connected, wallet } = useWallet();

  useEffect(() => {
    fetchPredictions();
  }, []);

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
        initialStake: pred.initial_stake.toString(),
      })));
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const handleBet = (predictionId: number, betType: 'yes' | 'no', amount: number) => {
    setPredictions(predictions.map(pred => {
      if (pred.id === predictionId) {
        if (isPast(endOfDay(new Date(pred.end_date)))) {
          alert("This prediction has ended and can't be bet on.");
          return pred;
        }
        const updatedPrediction = {
          ...pred,
          yes_ada: betType === 'yes' ? pred.yes_ada + amount : pred.yes_ada,
          no_ada: betType === 'no' ? pred.no_ada + amount : pred.no_ada,
          bets: [
            ...(pred.bets || []),
            {
              id: Date.now(),
              prediction_id: predictionId,
              user_wallet_address: 'Current User',
              amount: amount,
              bet_type: betType,
              created_at: new Date().toISOString(),
            },
          ],
        };
        setSelectedPrediction(updatedPrediction);
        return updatedPrediction;
      }
      return pred;
    }));
  };

  const handleCreateBet = () => {
    if (connected) {
      setShowCreateForm(true);
    } else {
      alert('Please connect your wallet to create a bet.');
    }
  };

  const handleNewPrediction = (newPrediction: Prediction) => {
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

  // Update the Comment interface
  interface Comment {
    id: number;
    prediction_id: number;
    user_wallet_address: string;
    content: string;
    created_at: string;
    upvotes: number;
    downvotes: number;
  }

  // Update the handleAddComment function
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
      <div className="relative z-10">
        <Header borderThickness={1} />
        <div className="sticky top-0 z-10 bg-[#000033] shadow-md">
          <div className="flex justify-between items-center py-2 px-4 border-b border-gray-700">
            <div className="flex overflow-x-auto space-x-2">
              <button className="px-3 py-1 bg-blue-500 rounded-full whitespace-nowrap text-xs hover:bg-blue-600">
                Top
              </button>
              <button className="px-3 py-1 bg-blue-500 rounded-full whitespace-nowrap text-xs hover:bg-blue-600">
                New
              </button>
              <button className="px-3 py-1 bg-blue-500 rounded-full whitespace-nowrap text-xs hover:bg-blue-600">
                Crypto Prices
              </button>
              <button className="px-3 py-1 bg-blue-500 rounded-full whitespace-nowrap text-xs hover:bg-blue-600">
                Bitcoin
              </button>
              <button className="px-3 py-1 bg-blue-500 rounded-full whitespace-nowrap text-xs hover:bg-blue-600">
                Airdrops
              </button>
              <button className="px-3 py-1 bg-blue-500 rounded-full whitespace-nowrap text-xs hover:bg-blue-600">
                Ethereum
              </button>
              <button className="px-3 py-1 bg-blue-500 rounded-full whitespace-nowrap text-xs hover:bg-blue-600">
                Memecoins
              </button>
              <button className="px-3 py-1 bg-blue-500 rounded-full whitespace-nowrap text-xs hover:bg-blue-600">
                Stablecoins
              </button>
              <button className="px-3 py-1 bg-blue-500 rounded-full whitespace-nowrap text-xs hover:bg-blue-600">
                Cardano
              </button>
              <button className="px-3 py-1 bg-blue-500 rounded-full whitespace-nowrap text-xs hover:bg-blue-600">
                More
              </button>
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
            {predictions.map((prediction) => {
              const percentageChance = calculatePercentageChance(prediction.yes_ada, prediction.no_ada);
              const progressColor = getProgressColor(percentageChance);
              const timeToEnding = getTimeToEnding(prediction.end_date);
              const daysLeft = differenceInDays(endOfDay(new Date(prediction.end_date)), new Date());
              const isEnded = isPast(endOfDay(new Date(prediction.end_date)));
              return (
                <div 
                  key={prediction.id} 
                  className={`bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer ${isEnded ? 'opacity-75' : ''}`}
                  onClick={() => handlePredictionClick(prediction)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold w-3/4">{prediction.title}</h3>
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
          <CreateBetForm
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
    </div>
  );
}

export default AdaBetsPage;