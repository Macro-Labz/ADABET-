import React from 'react';

interface BetPopupProps {
  onClose: () => void;
}

const BetPopup: React.FC<BetPopupProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96">
        <div className="flex justify-between mb-4">
          <div className="space-y-2">
            {['$1', '$5', '$10', '$50'].map((amount) => (
              <button key={amount} className="block w-24 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                {amount}
              </button>
            ))}
          </div>
          <button className="w-24 h-24 bg-green-500 text-white rounded hover:bg-green-600">
            Confirm
          </button>
        </div>
        <button onClick={onClose} className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BetPopup;