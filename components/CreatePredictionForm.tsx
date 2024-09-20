import React, { useState } from 'react';
import { useWallet } from "@meshsdk/react";

interface CreatePredictionFormProps {
  onClose: () => void;
  onSubmit: (prediction: any) => void;
}

const CreatePredictionForm: React.FC<CreatePredictionFormProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeEnds, setTimeEnds] = useState('');
  const [tag, setTag] = useState('');
  const { wallet } = useWallet();

  const tags = ['Opinion', 'Crypto Prices', 'Memecoins', 'Cardano'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet) {
      console.error('Wallet not connected');
      return;
    }

    try {
      const walletAddress = await wallet.getChangeAddress();

      console.log('Submitting prediction:', { title, content, endDate, timeEnds, creatorWalletAddress: walletAddress, tag });

      const response = await fetch('/api/createPrediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          endDate,
          timeEnds,
          creatorWalletAddress: walletAddress,
          tag,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create prediction');
      }

      const data = await response.json();
      console.log('Prediction created:', data);
      onSubmit(data.prediction);
      onClose();
    } catch (error) {
      console.error('Error creating prediction:', error);
      // Handle error (e.g., show error message to user)
      alert(`Failed to create prediction: ${(error as Error).message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 rounded-lg w-96 border-2 border-blue-500">
        <h2 className="text-xl font-bold mb-4 text-white">Create New Prediction</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mb-2 bg-black rounded border border-blue-500 text-white"
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 mb-2 bg-black rounded border border-blue-500 text-white"
            required
          />
          <div className="relative mb-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-black rounded border border-blue-500 text-white"
              required
              style={{colorScheme: 'dark'}}
            />
          </div>
          <div className="relative mb-2">
            <input
              type="time"
              value={timeEnds}
              onChange={(e) => setTimeEnds(e.target.value)}
              className="w-full p-2 bg-black rounded border border-blue-500 text-white"
              required
              style={{colorScheme: 'dark'}}
            />
          </div>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full p-2 mb-2 bg-black rounded border border-blue-500 text-white appearance-none"
            required
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.7rem top 50%',
              backgroundSize: '1.5em auto'
            }}
          >
            <option value="">Select a tag</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded mr-2 text-white hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePredictionForm;