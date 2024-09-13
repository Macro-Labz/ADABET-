'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from "@meshsdk/react";
import Header from '../components/Header';
import { GridPattern } from '../components/magicui/animated-grid-pattern';
import Graph from '../components/Graph';

interface Prediction {
  id: number;
  title: string;
  content: string;
  yes_ada: number;
  no_ada: number;
  end_date: string;
  initial_stake: number;
  created_at: string;
}

interface Bet {
  id: number;
  prediction_id: number;
  amount: number;
  bet_type: 'yes' | 'no';
  created_at: string;
  predictions: { title: string };
}

const ProfilePage: React.FC = () => {
  const { connected, wallet } = useWallet();
  const router = useRouter();
  const [balance, setBalance] = useState<string>('0');
  const [activeBets, setActiveBets] = useState<number>(0);
  const [winningBets, setWinningBets] = useState<number>(0);
  const [losingBets, setLosingBets] = useState<number>(0);
  const [lifetimeProfitLoss, setLifetimeProfitLoss] = useState<number>(0);
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);
  const [userBets, setUserBets] = useState<Bet[]>([]);

  useEffect(() => {
    if (connected && wallet) {
      fetchBalance();
      fetchUserBets();
      fetchUserPredictions();
    } else if (!connected) {
      router.push('/');
    }
  }, [connected, wallet, router]);

  const fetchBalance = async () => {
    if (wallet) {
      const balance = await wallet.getBalance();
      const lovelace = balance.find((asset) => asset.unit === 'lovelace');
      const adaBalance = lovelace ? BigInt(lovelace.quantity) : BigInt(0);
      setBalance((Number(adaBalance) / 1000000).toString());
    }
  };

  const fetchUserPredictions = async () => {
    if (wallet) {
      try {
        const walletAddress = await wallet.getChangeAddress();
        const response = await fetch(`/api/getUserPredictions?walletAddress=${walletAddress}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user predictions');
        }
        const data = await response.json();
        setUserPredictions(data.predictions);
      } catch (error) {
        console.error('Error fetching user predictions:', error);
      }
    }
  };

  const fetchUserBets = async () => {
    if (wallet) {
      try {
        const walletAddress = await wallet.getChangeAddress();
        console.log('Fetching bets for wallet address:', walletAddress);
        
        const response = await fetch(`/api/getUserBets?walletAddress=${walletAddress}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user bets');
        }
        const data = await response.json();
        console.log('Fetched user bets:', data);
        
        if (data.status === 'success' && Array.isArray(data.bets)) {
          setUserBets(data.bets);
          
          // Update betting statistics
          const winningBets = data.bets.filter((bet: Bet) => bet.bet_type === 'yes').length;
          const losingBets = data.bets.filter((bet: Bet) => bet.bet_type === 'no').length;
          setWinningBets(winningBets);
          setLosingBets(losingBets);
          setActiveBets(data.bets.length);

          // Calculate lifetime profit/loss (this is a simplified calculation)
          const profitLoss = data.bets.reduce((total: number, bet: Bet) => {
            return total + (bet.bet_type === 'yes' ? bet.amount : -bet.amount);
          }, 0);
          setLifetimeProfitLoss(profitLoss);
        } else {
          console.error('Unexpected data format:', data);
        }
      } catch (error) {
        console.error('Error fetching user bets:', error);
      }
    }
  };

  const calculateWinLossRatio = (): { ratio: string; color: string } => {
    if (losingBets === 0) return { ratio: winningBets.toString(), color: 'text-green-500' };
    const ratio = winningBets / losingBets;
    const formattedRatio = ratio.toFixed(2);
    let color = 'text-blue-500';
    if (ratio > 1) color = 'text-green-500';
    else if (ratio < 1) color = 'text-red-500';
    return { ratio: formattedRatio, color };
  };

  const formatProfitLoss = (value: number): string => {
    const formattedValue = Math.abs(value).toFixed(2);
    return value >= 0 ? `+${formattedValue}` : `-${formattedValue}`;
  };

  if (!connected) {
    return null;
  }

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
      <div className="relative z-10 flex flex-col flex-grow">
        <Header borderThickness={1} />
        
        {/* User Profile Title */}
        <div className="container mx-auto px-4 mt-4">
          <h1 className="text-2xl font-bold mb-4">- USER PROFILE -</h1>
        </div>

        {/* Portfolio Summary Boxes */}
        <div className="bg-gray-900 p-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-7 gap-4 text-sm">
              <div className="col-span-2 bg-gray-800 p-2 rounded">
                <div className="font-bold">Total Portfolio Value</div>
                <div className="text-blue-500 font-bold">{balance} ADA</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div>Active Bets:</div>
                <div className="text-blue-500 font-bold">{activeBets}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div>Wins:</div>
                <div className="text-green-500 font-bold">{winningBets}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div>Losses:</div>
                <div className="text-red-500 font-bold">{losingBets}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div>Win/Loss Ratio:</div>
                {(() => {
                  const { ratio, color } = calculateWinLossRatio();
                  return <div className={`${color} font-bold`}>{ratio}</div>;
                })()}
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div>Lifetime Profit/Loss:</div>
                <div className={`${lifetimeProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'} font-bold`}>
                  {formatProfitLoss(lifetimeProfitLoss)} ADA
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Large Box */}
        <div className="container mx-auto px-4 mt-8 flex justify-center">
          <div className="w-[800px] h-[400px] bg-gray-900 rounded-lg shadow-lg p-4 flex items-center justify-center">
            {/* Graph component */}
            <div className="w-[100%] h-[102%]">
              <Graph />
            </div>
          </div>
        </div>

        {/* Betting History Box */}
        <div className="w-full mt-8 flex-grow flex flex-col bg-gray-900">
          <div className="container mx-auto px-4 py-4 flex flex-col h-[400px]">
            <h2 className="text-xl font-bold mb-4">Betting History</h2>
            <div className="overflow-y-auto flex-grow">
              <table className="w-full">
                <thead className="bg-black sticky top-0">
                  <tr>
                    <th className="py-2 px-4 text-left">Prediction</th>
                    <th className="py-2 px-4 text-left">Amount</th>
                    <th className="py-2 px-4 text-left">Bet Type</th>
                    <th className="py-2 px-4 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userBets.length > 0 ? (
                    userBets.map((bet) => (
                      <tr key={bet.id} className="bg-black border-b border-gray-700">
                        <td className="py-2 px-4">{bet.predictions?.title || 'Unknown Prediction'}</td>
                        <td className="py-2 px-4 text-blue-500">{bet.amount} ADA</td>
                        <td className={`py-2 px-4 ${bet.bet_type === 'yes' ? 'text-green-500' : 'text-red-500'}`}>
                          {bet.bet_type.toUpperCase()}
                        </td>
                        <td className="py-2 px-4">{new Date(bet.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center">No betting history available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* User's Created Predictions */}
        <div className="w-full mt-8 flex-grow flex flex-col bg-gray-900">
          <div className="container mx-auto px-4 py-4 flex flex-col h-[400px]">
            <h2 className="text-xl font-bold mb-4">Your Created Predictions</h2>
            <div className="overflow-y-auto flex-grow">
              <table className="w-full">
                <thead className="bg-black sticky top-0">
                  <tr>
                    <th className="py-2 px-4 text-left">Title</th>
                    <th className="py-2 px-4 text-left">Yes ADA</th>
                    <th className="py-2 px-4 text-left">No ADA</th>
                    <th className="py-2 px-4 text-left">End Date</th>
                    <th className="py-2 px-4 text-left">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {userPredictions.map((prediction) => (
                    <tr key={prediction.id} className="bg-black border-b border-gray-700">
                      <td className="py-2 px-4">{prediction.title}</td>
                      <td className="py-2 px-4 text-green-500">{prediction.yes_ada} ADA</td>
                      <td className="py-2 px-4 text-red-500">{prediction.no_ada} ADA</td>
                      <td className="py-2 px-4">{new Date(prediction.end_date).toLocaleDateString()}</td>
                      <td className="py-2 px-4">{new Date(prediction.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-4">
          {/* Add your profile content here */}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;