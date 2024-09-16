'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CardanoWallet, useWallet } from "@meshsdk/react";
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

interface HeaderProps {
  borderThickness?: number;
  onSearch?: (searchTerm: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Header: React.FC<HeaderProps> = ({ borderThickness = 2, onSearch, searchTerm, setSearchTerm }) => {
  const { connected, wallet, connect } = useWallet();
  const router = useRouter();
  const isProfilePage = router.pathname === '/profile';

  const buttonText = isProfilePage ? 'BETTING' : 'PROFILE';
  const buttonHref = isProfilePage ? '/adabets' : '/profile';

  useEffect(() => {
    const autoConnect = async () => {
      if (!connected) {
        const wallets = ["vespr", "eternl", "nami"];
        for (const walletName of wallets) {
          try {
            await connect(walletName);
            break; // Stop if successfully connected
          } catch (error) {
            console.log(`Failed to connect to ${walletName}`);
          }
        }
      }
    };

    autoConnect();
  }, [connected, connect]);

  useEffect(() => {
    const handleUserLogin = async () => {
      if (connected && wallet) {
        try {
          const walletAddress = await wallet.getChangeAddress();
          
          // Check if user exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('wallet_address')
            .eq('wallet_address', walletAddress)
            .single();

          if (!existingUser) {
            // Insert new user
            await supabase
              .from('users')
              .insert({ wallet_address: walletAddress, last_login: new Date().toISOString() });
          } else {
            // Update last login
            await fetch('/api/updateLastLogin', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ walletAddress }),
            });
          }
        } catch (error) {
          console.error('Error handling user login:', error);
        }
      }
    };

    handleUserLogin();
  }, [connected, wallet]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
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
            placeholder="Search predictions..."
            className="w-1/3 px-2 py-1 text-black rounded text-sm"
            value={searchTerm}
            onChange={handleSearch}
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
          <CardanoWallet isDark={true}/>
        </div>
      </div>
      <div className="bg-white" style={{ height: `${borderThickness}px` }}></div>
    </header>
  );
};

export default Header;