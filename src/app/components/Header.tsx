'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  borderThickness?: number;
}

const Header: React.FC<HeaderProps> = ({ borderThickness = 2 }) => {
  const [isWalletPopupOpen, setIsWalletPopupOpen] = useState(false);

  const wallets = ['Nami', 'Eternl', 'Flint', 'Gero'];

  const connectWallet = (walletName: string) => {
    console.log(`Connecting to ${walletName} wallet`);
    setIsWalletPopupOpen(false);
  };

  const toggleWalletPopup = () => {
    setIsWalletPopupOpen(!isWalletPopupOpen);
  };

  return (
    <header className="bg-[#000033] text-white relative">
      <div className="p-2 flex items-center justify-between">
        <div className="flex items-center w-full">
          <Link href="/" className="mr-4">
            <Image
              src="/ADA BETS LOGO1.png"
              alt="ADA BETS LOGO"
              width={80}
              height={40}
            />
          </Link>
          <input
            type="search"
            placeholder="Search..."
            className="w-1/3 px-2 py-1 text-black rounded text-sm"
          />
        </div>
        <button
          onClick={toggleWalletPopup}
          className="animate-pulse bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 font-bold"
          style={{"--duration": "2s", "--pulse-color": "rgba(59, 130, 246, 0.5)"} as React.CSSProperties}
        >
          Connect Wallet
        </button>
        {isWalletPopupOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white rounded shadow-lg p-2 z-50">
            {wallets.map((wallet) => (
              <button
                key={wallet}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-600"
                onClick={() => connectWallet(wallet)}
              >
                {wallet}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white" style={{ height: `${borderThickness}px` }}></div>
    </header>
  );
};

export default Header;