'use client';

import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import Header from './components/Header';
import GridPattern from './components/magicui/GridPatternBackground';

// This is the main page component for the application
export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#000033] text-white">
      <GridPattern
        fillColor="rgba(0, 0, 255, 0.7)"
        strokeColor="rgba(0, 0, 0, 0.1)"
        className="absolute inset-0"
      />
      <div className="relative z-10 flex flex-col flex-grow">
        <Header borderThickness={1} />

        <main className="flex-grow flex flex-col items-center justify-center p-24">
          <h2 className="text-4xl font-bold mb-8 text-blue-600">Welcome to ADA BETS</h2>
          <div className="bg-white p-8 rounded-lg shadow-md mb-8 w-full max-w-2xl">
            <p className="text-xl mb-6 text-black text-center">Your trusted platform for sports betting and predictions.</p>
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
              <Image src="/MR.Ballin Profile 1.png" alt="Team Member 1" width={200} height={200} className="rounded-lg mb-4" />
              <input type="text" placeholder="Name" className="mb-2 p-2 w-full text-black" />
              <input type="text" placeholder="Twitter Handle" className="mb-2 p-2 w-full text-black" />
              <input type="text" placeholder="Position" className="p-2 w-full text-black" />
            </div>
            <div className="flex flex-col items-center">
              <Image src="/MacroMan Profile1.png" alt="Team Member 2" width={200} height={200} className="rounded-lg mb-4" />
              <input type="text" placeholder="Name" className="mb-2 p-2 w-full text-black" />
              <input type="text" placeholder="Twitter Handle" className="mb-2 p-2 w-full text-black" />
              <input type="text" placeholder="Position" className="p-2 w-full text-black" />
            </div>
          </div>
        </main>
      </div>

      <footer className="text-center p-4 text-white w-full">
        © 2024 AdaBets. All rights reserved.
      </footer>
    </div>
  );
}
