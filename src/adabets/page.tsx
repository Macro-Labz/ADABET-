'use client';

import React, { useState } from 'react';
import Header from '../../@/components/Header';
import BetPopup from '../../@/components/BetPopup';
import ShinyButton from '../components/magicui/shiny-button';
import GridPattern from '../components/magicui/GridPatternBackground';

const AdaBetsPage: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handleBet = () => {
    setShowPopup(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#000033] text-white relative">
      <GridPattern
        fillColor="rgba(0, 0, 255, 0.7)"
        strokeColor="rgba(0, 0, 0, 0.1)"
        className="absolute inset-0"
      />
      <div className="relative z-10">
        <Header borderThickness={1} />
        <div className="sticky top-0 z-10 bg-[#000033] shadow-md">
          <div className="flex overflow-x-auto py-2 space-x-2 border-b border-gray-700">
            {['Top', 'New', 'Crypto Prices', 'Bitcoin', 'Airdrops', 'Ethereum', 'Memecoins', 'Stablecoins', 'Cardano', 'More'].map((text) => (
              <button key={text} className="px-3 py-1 bg-blue-500 rounded-full whitespace-nowrap text-xs hover:bg-blue-600">
                {text}
              </button>
            ))}
          </div>
        </div>
        <div className="container mx-auto px-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(16)].map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Prediction {index + 1}</h3>
                <p>Content for prediction {index + 1}</p>
                <div className="mt-4 flex justify-between">
                  <ShinyButton
                    text="Bet Yes"
                    color="rgb(34, 197, 94)"
                    onClick={handleBet}
                    className="px-4 py-2 bg-green-500 rounded hover:bg-green-600"
                  />
                  <ShinyButton
                    text="Bet No"
                    color="rgb(239, 68, 68)"
                    onClick={handleBet}
                    className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        {showPopup && <BetPopup onClose={() => setShowPopup(false)} />}
      </div>
    </div>
  );
}

export default AdaBetsPage;

