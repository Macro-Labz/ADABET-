import React from 'react';
import ShinyButton from './magicui/shiny-button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

interface Bet {
  wallet_address: string;
  bet_type: 'Yes' | 'No';
  bet_amount: number;
  is_winner: boolean;
  payout: number;
}

interface PredictionResultDetailsProps {
  prediction: {
    id: number;
    title: string;
    content: string;
    yes_ada: number;
    no_ada: number;
    end_date: string;
    bets: any[]; // You might want to define a proper type for bets
    comments: any[]; // You might want to define a proper type for comments
    created_at: string;
  };
  onClose: () => void;
}

const PredictionResultDetails: React.FC<PredictionResultDetailsProps> = ({ prediction, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 rounded-lg shadow-xl w-4/5 h-[800px] overflow-y-auto border-2 border-blue-500 relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-gray-300"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Prediction Result Details</h2>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Title</h3>
          <p>{prediction.title}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Content</h3>
          <p>{prediction.content}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Final Results</h3>
          <p>Yes: {prediction.yes_ada.toFixed(2)} ADA</p>
          <p>No: {prediction.no_ada.toFixed(2)} ADA</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Detailed Results</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Bet Type</TableHead>
                <TableHead>Bet Amount</TableHead>
                <TableHead>Winner/Loser</TableHead>
                <TableHead>Winngs/Losses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(50)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>Row {index + 1}, Col 1</TableCell>
                  <TableCell>Row {index + 1}, Col 2</TableCell>
                  <TableCell>Row {index + 1}, Col 3</TableCell>
                  <TableCell>Row {index + 1}, Col 4</TableCell>
                  <TableCell>Row {index + 1}, Col 5</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Add more detailed information here */}
        {/* For example, you could include:
            - A list of all bets
            - A breakdown of rewards (if applicable)
            - Charts or graphs showing the prediction's progress over time
            - Any other relevant statistics or information
        */}
      </div>
    </div>
  );
};

export default PredictionResultDetails;