'use client'

import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import { Inter } from "next/font/google";
import Head from "next/head";
import Header from '../components/Header';
import { GridPattern } from '../components/magicui/animated-grid-pattern';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const inter = Inter({ subsets: ["latin"] });

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
  font-size: 6rem;
  font-weight: bold;
  text-transform: uppercase;
  animation: ${glow} 2s ease-in-out infinite alternate;
`;

// This is the main page component for the application
export default function HomePage() {
  return (
    <>
      <Head>
        <title>ADA BETS - Cardano Sports Betting Platform</title>
        <meta name="description" content="ADA BETS - Your trusted platform for sports betting and predictions on Cardano" />
        <style>{`
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
          }
          #__next {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .cool-text {
            font-size: 6rem; // Increased from 4rem to 6rem
            font-weight: 900;
            text-transform: uppercase;
            background: linear-gradient(to bottom, #00ffff, #0000ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            text-align: center; // Added to ensure center alignment
            line-height: 1.2; // Added to adjust line spacing if text wraps
          }
        `}</style>
      </Head>
      <div className="flex-grow relative bg-gradient-to-b from-gray-900 to-black text-white">
        <GridPattern
          width={40}
          height={40}
          className="absolute inset-0 w-full h-full"
          numSquares={100}
          maxOpacity={0.3}
          duration={5}
        />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header borderThickness={1} searchTerm={""} setSearchTerm={() => {}} />
          {/* Add appropriate values for searchTerm and setSearchTerm */}
          
          <main className={`flex-grow flex flex-col items-center justify-center p-24 ${inter.className}`}>
            <NeonText className="mb-8 text-center">
              Welcome to ADA BETS
            </NeonText>
            <div className="bg-gradient-radial from-gray-800 via-gray-900 to-black p-8 rounded-lg border-2 border-blue-500 mb-8 shadow-md w-full max-w-2xl">
              <p className="text-xl mb-6 text-white text-center">Your Trusted Platform for Market Price Prediction and Opinion Based Betting.</p>
              <div className="flex justify-center">
                <Link href="/adabets">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>

            <div className="flex justify-center space-x-8">
              <div className="flex flex-col items-center">
                <Image src="/mrbp4.png" alt="Team Member 1" width={200} height={200} className="rounded-lg mb-4" />
                <p className="font-bold mb-2 text-xl">Mr.Ballin</p>
                <p className="font-bold mb-2 text-base">@Mr_ballin05</p>
              <p className="font-bold text-base">Developer</p>
              </div>
              <div className="flex flex-col items-center">
                <Image src="/MMP1.png" alt="Team Member 2" width={200} height={200} className="rounded-lg mb-4" />
                <p className="font-bold mb-2 text-xl">Tha MacroMan</p>
                <p className="font-bold mb-2 text-base">@ThaMacroMan</p>
                <p className="font-bold text-base">Developer</p>
              </div>
            </div>
          </main>

          {/* Footer has been removed */}
        </div>
      </div>
    </>
  );
}
