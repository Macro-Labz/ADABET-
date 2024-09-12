'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from "@meshsdk/react";
import Header from '../../@/components/Header';
import { GridPattern } from '../../@/components/magicui/animated-grid-pattern';
import Graph from '../../@/components/Graph';

const ProfilePage: React.FC = () => {
  const { connected, wallet } = useWallet();
  const router = useRouter();
  const [balance, setBalance] = useState<string>('0');
  const [activeBets, setActiveBets] = useState<number>(0);
  const [winningBets, setWinningBets] = useState<number>(0);
  const [losingBets, setLosingBets] = useState<number>(0);
  const [lifetimeProfitLoss, setLifetimeProfitLoss] = useState<number>(0);

  useEffect(() => {
    if (!connected) {
      router.push('/');
    } else {
      fetchBalance();
      fetchActiveBets();
      fetchBetStats(); // New function to fetch bet statistics
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

  const fetchActiveBets = async () => {
    // TODO: Replace this with actual API call or data fetching logic
    // For now, we'll use a mock value
    setActiveBets(3); // Example: User has 3 active bets
  };

  const fetchBetStats = async () => {
    // TODO: Replace this with actual API call or data fetching logic
    // For now, we'll use mock values
    setWinningBets(7); // Example: User has 7 winning bets
    setLosingBets(3); // Example: User has 3 losing bets
    setLifetimeProfitLoss(1500); // Example: User has a profit of 1500 ADA
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
            <div className="w-[95%] h-[95%]">
              <Graph />
            </div>
          </div>
        </div>

        {/* Single Box Banner */}
        <div className="bg-gray-900 flex-grow mt-8">
          <div className="container mx-auto h-full">
            <div className="grid grid-cols-1 gap-4 text-sm h-full">
              <div className="bg-gray-800 p-2 rounded">
                <div className="font-bold">Betting History</div>
                <div>Content goes here</div>
              </div>
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