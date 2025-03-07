'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'blue',
  className = '',
  text,
}) => {
  // Map size to pixel values
  const sizeMap = {
    small: 16,
    medium: 32,
    large: 48,
  };

  // Map color names to Tailwind classes
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500',
    red: 'border-red-500',
    green: 'border-green-500',
    yellow: 'border-yellow-500',
    purple: 'border-purple-500',
    gray: 'border-gray-500',
    white: 'border-white',
  };

  const spinnerSize = sizeMap[size];
  const spinnerColor = colorMap[color] || 'border-blue-500';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`border-2 rounded-full ${spinnerColor} border-t-transparent animate-spin`}
        style={{
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`,
        }}
        role="status"
        aria-label="loading"
      />
      {text && (
        <p className="mt-2 text-sm text-gray-500">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;