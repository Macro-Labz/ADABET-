'use client'

import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import { Inter, Roboto } from "next/font/google";
import Head from "next/head";
import Header from '../components/Header';
import { GridPattern } from '../components/magicui/animated-grid-pattern';
import BlurIn from '../components/magicui/blur-in';
import ShineBorder from '../components/magicui/shine-border';
import GridPatternBackground from '../components/magicui/GridPatternBackground';

const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({ weight: '900', subsets: ["latin"] });

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
            <h1 className={`mb-8 ${roboto.className} cool-text`}>
              Welcome to ADA BETS
            </h1>
            <ShineBorder borderWidth={2} color="#ffffff" className="mb-8 bg-white rounded-lg shadow-md w-full max-w-2xl">
              <div className="p-8">
                <p className="text-xl mb-6 text-black text-center">Your trusted platform for sports betting and predictions.</p>
                <div className="flex justify-center">
                  <Link href="/adabets">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </ShineBorder>

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
