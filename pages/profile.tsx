'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from "@meshsdk/react";
import { GridPattern } from '../components/magicui/animated-grid-pattern';
import Graph from '../components/Graph';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../components/Header';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
  transaction_id: string;
}

const glow = keyframes`
  0% {
    text-shadow: 0 0 3px #3b82f6, 0 0 6px #3b82f6, 0 0 9px #3b82f6;
  }
  50% {
    text-shadow: 0 0 6px #3b82f6, 0 0 12px #3b82f6, 0 0 18px #3b82f6;
  }
  100% {
    text-shadow: 0 0 3px #3b82f6, 0 0 6px #3b82f6, 0 0 9px #3b82f6;
  }
`;

const NeonText = styled.h1`
  color: #fff;
  font-size: 2rem;
  font-weight: bold;
  text-transform: uppercase;
  animation: ${glow} 2s ease-in-out infinite alternate;
`;

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [betHistory, setBetHistory] = useState<{ date: string; profitLoss: number }[]>([]);
  const [showValues, setShowValues] = useState(true);

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

          // Calculate lifetime profit/loss and prepare graph data
          let runningTotal = 0;
          const graphData = data.bets
            .sort((a: Bet, b: Bet) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((bet: Bet) => {
              runningTotal += bet.bet_type === 'yes' ? bet.amount : -bet.amount;
              return {
                date: new Date(bet.created_at).toLocaleDateString(),
                profitLoss: runningTotal
              };
            });

          setLifetimeProfitLoss(runningTotal);
          setBetHistory(graphData);
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

  const toggleValueVisibility = () => {
    setShowValues(!showValues);
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative">
      <GridPattern
        width={40}
        height={40}
        className="absolute inset-0 w-full h-full"
        numSquares={100}
        maxOpacity={0.3}
        duration={5}
      />
      <div className="relative z-10 flex flex-col flex-grow">
        <div className="relative">
          <Header 
            borderThickness={1} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />
          <NeonText className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            - USER PROFILE -
          </NeonText>
        </div>

        {/* Portfolio Summary Boxes */}
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 border-b border-gray-700" style={{ borderBottomWidth: '0.5px' }}>
          <div className="container mx-auto">
            <div className="grid grid-cols-7 gap-4 text-sm">
              {[
                { label: "Total Portfolio Value", value: `${balance} ADA` },
                { label: "Active Bets:", value: activeBets },
                { label: "Wins:", value: winningBets, color: "text-green-500" },
                { label: "Losses:", value: losingBets, color: "text-red-500" },
                { label: "Win/Loss Ratio:", value: calculateWinLossRatio().ratio, color: calculateWinLossRatio().color },
                { label: "Lifetime Profit/Loss:", value: `${formatProfitLoss(lifetimeProfitLoss)} ADA`, color: lifetimeProfitLoss >= 0 ? "text-green-500" : "text-red-500" },
              ].map((item, index) => (
                <div key={index} className={`${index === 0 ? "col-span-2" : ""} bg-gradient-radial from-gray-800 via-gray-900 to-black p-2 rounded-lg border-2 border-blue-500 relative`}>
                  <div className="font-bold">{item.label}</div>
                  <div className={`${item.color || "text-blue-500"} font-bold`}>
                    {showValues ? item.value : '************'}
                  </div>
                  {index === 0 && (
                    <button 
                      onClick={toggleValueVisibility}
                      className="absolute top-2 right-2 text-blue-500 hover:text-blue-400 transition-colors duration-200"
                    >
                      {showValues ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Large Box for Graph */}
        <div className="container mx-auto px-4 my-8 flex justify-center items-center flex-grow">
          <div className="w-[900px] h-[460px] bg-gradient-radial from-gray-800 via-gray-900 to-black rounded-lg shadow-lg p-4 flex items-center justify-center border-2 border-blue-500">
            {/* Graph component */}
            <div className="w-[95%] h-[95%] border border-gray-700 rounded">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={betHistory}>
                  <CartesianGrid vertical={false} horizontal={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={{ stroke: 'white' }} 
                    tickLine={false}
                    tick={{ fill: 'white' }}
                  />
                  <YAxis 
                    axisLine={{ stroke: 'white' }} 
                    tickLine={false}
                    tick={{ fill: 'white' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none' }}
                    labelStyle={{ color: 'white' }}
                    itemStyle={{ color: 'white' }}
                  />
                  <Line type="monotone" dataKey="profitLoss" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Betting History Box */}
        <div className="w-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="container mx-auto px-4 py-4 flex flex-col">
            <div className="bg-gradient-radial from-gray-800 via-gray-900 to-black p-4 rounded-lg border-2 border-blue-500 mb-4">
              <h2 className="text-xl font-bold">Betting History</h2>
            </div>
            <div className="overflow-y-auto h-[300px] border-2 border-blue-500 rounded-lg">
              <table className="w-full">
                <thead className="bg-black sticky top-0">
                  <tr>
                    <th className="py-2 px-4 text-left">Prediction</th>
                    <th className="py-2 px-4 text-left">Amount</th>
                    <th className="py-2 px-4 text-left">Bet Type</th>
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-left">Transaction ID</th>
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
                        <td className="py-2 px-4 text-xs">{bet.transaction_id}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center">No betting history available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Your Created Predictions */}
        <div className="w-full flex flex-col bg-gradient-to-br from-black via-gray-900 to-gray-900">
          <div className="container mx-auto px-4 py-4 flex flex-col">
            <div className="bg-gradient-radial from-gray-800 via-gray-900 to-black p-4 rounded-lg border-2 border-blue-500 mb-4">
              <h2 className="text-xl font-bold">Your Created Predictions</h2>
            </div>
            <div className="overflow-y-auto h-[300px] border-2 border-blue-500 rounded-lg">
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