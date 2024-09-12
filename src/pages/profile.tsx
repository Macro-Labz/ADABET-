'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from "@meshsdk/react";
import Header from '../../@/components/Header';
import { GridPattern } from '../../@/components/magicui/animated-grid-pattern';
import Graph from '../../@/components/Graph';
import axios from 'axios';
import { format, subDays } from 'date-fns';

const ProfilePage: React.FC = () => {
  const { connected, wallet } = useWallet();
  const router = useRouter();
  const [balance, setBalance] = useState<string>('0');
  const [activeBets, setActiveBets] = useState<number>(0);
  const [winningBets, setWinningBets] = useState<number>(0);
  const [losingBets, setLosingBets] = useState<number>(0);
  const [lifetimeProfitLoss, setLifetimeProfitLoss] = useState<number>(0);
  const [totalBets, setTotalBets] = useState<number>(0);
  const [profitLossData, setProfitLossData] = useState<{ date: string; value: number }[]>([]);
  const [bettingHistory, setBettingHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!connected) {
      router.push('/');
    } else {
      fetchBalance();
      fetchUserData();
      fetchBettingHistory();
    }
  }, [connected, router, wallet]);

  const fetchBalance = async () => {
    if (wallet) {
      const balance = await wallet.getBalance();
      const lovelace = balance.find((asset) => asset.unit === 'lovelace');
      const adaBalance = lovelace ? BigInt(lovelace.quantity) : BigInt(0);
      setBalance((Number(adaBalance) / 1000000).toString()); // Convert lovelace to ADA
    }
  };

  const fetchUserData = async () => {
    if (wallet) {
      try {
        const addresses = await wallet.getUsedAddresses();
        const address = addresses[0]; // Use the first address
        const response = await axios.get(`/api/user/${address}`);
        const userData = response.data;
        setActiveBets(userData.activeBets);
        setWinningBets(userData.winningBets);
        setLosingBets(userData.losingBets);
        setLifetimeProfitLoss(userData.lifetimeProfitLoss);
        setTotalBets(userData.totalBets);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

  const fetchBettingHistory = async () => {
    if (wallet) {
      try {
        const addresses = await wallet.getUsedAddresses();
        const address = addresses[0];
        const response = await axios.get(`/api/user/${address}/profit-loss`);
        const data = response.data;
        
        setBettingHistory(data);
        
        // Transform the data for the graph
        const graphData = data.map((item: any) => ({
          date: item.date,
          value: item.profitLoss
        }));
        
        setProfitLossData(graphData);
      } catch (error) {
        console.error('Error fetching betting history data:', error);
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
    return null; // or a loading spinner
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
              <Graph data={profitLossData} />
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
                    <th className="py-2 px-4 text-left">BET - ID</th>
                    <th className="py-2 px-4 text-left">Amount</th>
                    <th className="py-2 px-4 text-left">Odds</th>
                    <th className="py-2 px-4 text-left">Result</th>
                    <th className="py-2 px-4 text-left">Profit/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {bettingHistory.map((bet) => {
                    const profitLossColor = 
                      bet.profitLoss > 0 ? 'text-green-500' :
                      bet.profitLoss < 0 ? 'text-red-500' : 'text-blue-500';
                    
                    return (
                      <tr key={bet.id} className="bg-black border-b border-gray-700">
                        <td className="py-2 px-4">BET-{bet.id}</td>
                        <td className="py-2 px-4 text-blue-500">{bet.amount} ADA</td>
                        <td className="py-2 px-4">{bet.odds}</td>
                        <td className={`py-2 px-4 ${bet.result === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                          {bet.result === 'win' ? 'Win' : 'Loss'}
                        </td>
                        <td className={`py-2 px-4 ${profitLossColor}`}>
                          {formatProfitLoss(bet.profitLoss)} ADA
                        </td>
                      </tr>
                    );
                  })}
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