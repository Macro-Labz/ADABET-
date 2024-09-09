import React from 'react';
import Header from './components/Header';

const AdaBets: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* 5 Horizontal Boxes */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="w-1/6 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              Box {num}
            </div>
          ))}
        </div>

        {/* 3 Vertical Boxes */}
        <div className="space-y-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              Box {num}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdaBets;
