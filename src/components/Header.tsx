'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CardanoWallet, useWallet } from "@meshsdk/react";
import { useRouter } from 'next/router';

interface HeaderProps {
  borderThickness?: number;
}

const Header: React.FC<HeaderProps> = ({ borderThickness = 2 }) => {
  const { connected, wallet } = useWallet();
  const router = useRouter();
  const isProfilePage = router.pathname === '/profile';

  const buttonText = isProfilePage ? 'BETTING' : 'PROFILE';
  const buttonHref = isProfilePage ? '/adabets' : '/profile';

  useEffect(() => {
    const createUserIfNeeded = async () => {
      if (connected && wallet) {
        try {
          const walletAddress = await wallet.getChangeAddress();
          const response = await fetch('/api/createUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ walletAddress }),
          });
          const result = await response.json();
          console.log('User creation result:', result);
        } catch (error) {
          console.error('Error creating user:', error);
        }
      }
    };

    createUserIfNeeded();
  }, [connected, wallet]);

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
        <div className="flex items-center space-x-4">
          {connected ? (
            <Link href={buttonHref}>
              <button className="px-8 py-4 bg-blue-500 rounded hover:bg-blue-600 text-base font-bold">
                {buttonText}
              </button>
            </Link>
          ) : (
            <button className="px-8 py-4 bg-gray-500 rounded text-base font-bold cursor-not-allowed" disabled>
              {buttonText}
            </button>
          )}
          <CardanoWallet />
        </div>
      </div>
      <div className="bg-white" style={{ height: `${borderThickness}px` }}></div>
    </header>
  );
};

export default Header;