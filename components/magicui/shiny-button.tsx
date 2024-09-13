"use client";

import React from 'react';

import { cn } from "../../lib/utils";

interface ShinyButtonProps {
  text: string;
  color: string;
  onClick: () => void;
  className?: string;
}

const ShinyButton: React.FC<ShinyButtonProps> = ({ text, color, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: color }}
    >
      <span className="relative z-10">{text}</span>
      <div className="absolute inset-0 overflow-hidden">
        {/* Add shiny effect elements here if needed */}
      </div>
    </button>
  );
};

export default ShinyButton;
