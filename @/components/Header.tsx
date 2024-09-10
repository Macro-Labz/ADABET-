'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CardanoWallet } from "@meshsdk/react";

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
        <CardanoWallet />
      </div>
      <div className="bg-white" style={{ height: `${borderThickness}px` }}></div>
    </header>
  );
};

export default Header;