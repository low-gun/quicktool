import React from "react";

const LoadingIndicator = ({ progress }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4">
      <div
        className="bg-blue-500 h-4 rounded-full transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default LoadingIndicator;
