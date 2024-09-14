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
        const updatedPrediction = {
          ...pred,
          yes_ada: betType === 'yes' ? pred.yes_ada + amount : pred.yes_ada,
          no_ada: betType === 'no' ? pred.no_ada + amount : pred.no_ada,
          bets: [
            ...(pred.bets || []),
            {
              id: Date.now(),
              prediction_id: predictionId, // Added prediction_id
              user_wallet_address: 'Current User', // Replace with actual user data when available
              amount: amount,
              bet_type: betType, // Added bet_type
              created_at: new Date().toISOString(), // Added created_at
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

  const calculateRatio = (yesAda: number, noAda: number) => {
    const total = yesAda + noAda;
    return total > 0 ? (yesAda / total).toFixed(2) : '0.50';
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {predictions.map((prediction) => (
              <div 
                key={prediction.id} 
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handlePredictionClick(prediction)}
              >
                <h3 className="text-lg font-semibold mb-2">{prediction.title}</h3>
                <p className="mb-2">{prediction.content}</p>
                <p className="text-sm mb-1">End Date: {prediction.end_date}</p>
                <p className="text-sm mb-1">Yes: {prediction.yes_ada} ADA</p>
                <p className="text-sm mb-1">No: {prediction.no_ada} ADA</p>
                <p className="text-sm mb-2">Ratio: {calculateRatio(prediction.yes_ada, prediction.no_ada)}</p>
                <div className="mt-4">
                  <ShinyButton
                    text="View Details"
                    color={prediction.color}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePredictionClick(prediction);
                    }}
                    className="w-full px-4 py-2 rounded hover:opacity-90 transition-opacity"
                  />
                </div>
              </div>
            ))}
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