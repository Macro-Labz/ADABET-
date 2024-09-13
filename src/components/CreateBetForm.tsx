import React, { useState } from 'react';
import ShinyButton from './magicui/shiny-button';

interface CreateBetFormProps {
  onClose: () => void;
  onSubmit: (prediction: any) => void;
}

const CreateBetForm: React.FC<CreateBetFormProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [endDate, setEndDate] = useState('');
  const [initialStake, setInitialStake] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: Date.now(),
      title,
      content,
      endDate,
      initialStake: parseFloat(initialStake),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create New Prediction Market</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Initial Stake (ADA)</label>
            <input
              type="number"
              value={initialStake}
              onChange={(e) => setInitialStake(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded"
              required
              min="0"
              step="0.1"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <ShinyButton
              text="Cancel"
              color="rgb(239, 68, 68)"
              onClick={onClose}
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
            />
            <ShinyButton
              text="Create"
              color="rgb(34, 197, 94)"
              onClick={() => handleSubmit({} as React.FormEvent)}
              className="px-4 py-2 bg-green-500 rounded hover:bg-green-600"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBetForm;