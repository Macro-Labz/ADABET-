'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../@/components/Header';
import BetPopup from '../../@/components/BetPopup';
import ShinyButton from '../../@/components/magicui/shiny-button';
import { GridPattern } from '../../@/components/magicui/animated-grid-pattern';
import CreateBetForm from '../../@/components/CreateBetForm';
import PredictionDetails from '../../@/components/PredictionDetails';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Update this function in the AdaBetsPage component
const generateUniqueColor = (index: number) => {
  const hue = (index * 137.5) % 360; // Golden angle approximation
  return `hsl(${hue}, 85%, 35%)`; // Increased saturation, decreased lightness
};

const AdaBetsPage: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [currentUser, setCurrentUser] = useState('User1'); // Simulating a logged-in user
  const router = useRouter();

  useEffect(() => {
    // Generate predictions on the client-side only
    setPredictions([...Array(16)].map((_, index) => ({
      id: index,
      title: `Prediction ${index + 1}`,
      content: `Content for prediction ${index + 1}`,
      yesAda: Math.floor(Math.random() * 1000),
      noAda: Math.floor(Math.random() * 1000),
      endDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bets: [],
      comments: [],
      color: generateUniqueColor(index), // Add this line to assign a unique color
    })));
  }, []);

  const handleBet = (predictionId: number, betType: 'yes' | 'no', amount: number) => {
    setPredictions(predictions.map(pred => {
      if (pred.id === predictionId) {
        const updatedPrediction = {
          ...pred,
          yesAda: betType === 'yes' ? pred.yesAda + amount : pred.yesAda,
          noAda: betType === 'no' ? pred.noAda + amount : pred.noAda,
          bets: [
            ...pred.bets,
            {
              id: Date.now(),
              user: 'Current User', // Replace with actual user data when available
              amount: amount,
              type: betType,
              timestamp: new Date().toISOString(),
            },
          ],
        };
        setSelectedPrediction(updatedPrediction); // Update the selected prediction
        return updatedPrediction;
      }
      return pred;
    }));
  };

  const handleCreateBet = () => {
    setShowCreateForm(true);
  };

  const handleNewPrediction = (newPrediction) => {
    setPredictions([
      {
        ...newPrediction,
        yesAda: parseFloat(newPrediction.initialStake),
        noAda: 0,
      },
      ...predictions
    ]);
    setShowCreateForm(false);
  };

  const calculateRatio = (yesAda: number, noAda: number) => {
    const total = yesAda + noAda;
    return total > 0 ? (yesAda / total).toFixed(2) : '0.50';
  };

  const handlePredictionClick = (prediction) => {
    setSelectedPrediction(prediction);
  };

  const handleAddComment = (predictionId: number, comment: Omit<Comment, 'id' | 'timestamp' | 'upvotes' | 'downvotes'>) => {
    setPredictions(predictions.map(pred => {
      if (pred.id === predictionId) {
        const newComment = {
          ...comment,
          id: Date.now(),
          timestamp: new Date().toISOString(),
          upvotes: 0,
          downvotes: 0,
        };
        const updatedPrediction = {
          ...pred,
          comments: [newComment, ...pred.comments],
        };
        setSelectedPrediction(updatedPrediction);
        return updatedPrediction;
      }
      return pred;
    }));
  };

  const handleVoteComment = (predictionId: number, commentId: number, voteType: 'up' | 'down') => {
    setPredictions(predictions.map(pred => {
      if (pred.id === predictionId) {
        const updatedComments = pred.comments.map(comment => {
          if (comment.id === commentId) {
            const prevVote = comment.userVote;
            const newUpvotes = comment.upvotes + (voteType === 'up' ? 1 : 0) - (prevVote === 'up' ? 1 : 0);
            const newDownvotes = comment.downvotes + (voteType === 'down' ? 1 : 0) - (prevVote === 'down' ? 1 : 0);
            
            return {
              ...comment,
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              userVote: voteType,
            };
          }
          return comment;
        });
        const updatedPrediction = {
          ...pred,
          comments: updatedComments,
        };
        setSelectedPrediction(updatedPrediction);
        return updatedPrediction;
      }
      return pred;
    }));
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
                color="rgb(59, 130, 246)"
                onClick={handleCreateBet}
                className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
              />
            )}
          </div>
        </div>
        <div className="container mx-auto px-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {predictions.map((prediction) => (
              <div 
                key={prediction.id} 
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-2">{prediction.title}</h3>
                <p className="mb-2">{prediction.content}</p>
                <p className="text-sm mb-1">End Date: {prediction.endDate}</p>
                <p className="text-sm mb-1">Yes: {prediction.yesAda} ADA</p>
                <p className="text-sm mb-1">No: {prediction.noAda} ADA</p>
                <p className="text-sm mb-2">Ratio: {calculateRatio(prediction.yesAda, prediction.noAda)}</p>
                <div className="mt-4">
                  <ShinyButton
                    text="BET"
                    color={prediction.color}
                    onClick={() => handlePredictionClick(prediction)}
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
            onClose={() => setSelectedPrediction(null)}
            onBet={handleBet}
            onAddComment={handleAddComment}
            onVoteComment={handleVoteComment}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
}

export default AdaBetsPage;