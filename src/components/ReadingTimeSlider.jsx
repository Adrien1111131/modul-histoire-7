import React from 'react';

const ReadingTimeSlider = ({ min = 2, max = 12, defaultValue = 10, value, onChange }) => {
  // Utiliser soit la valeur fournie, soit la valeur par défaut
  const currentValue = value !== undefined ? value : defaultValue;
  
  return (
    <div className="mb-6 bg-gray-50 border border-gray-200 rounded-md p-4">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="reading-time" className="text-sm font-medium text-gray-700">
          Temps de lecture : <span className="text-blue-600 font-semibold">{currentValue} minutes</span>
        </label>
        <div className="text-xs text-gray-500">
          {min} min - {max} min
        </div>
      </div>
      
      <input
        id="reading-time"
        type="range"
        min={min}
        max={max}
        value={currentValue}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Court</span>
        <span>Moyen</span>
        <span>Long</span>
      </div>
    </div>
  );
};

export default ReadingTimeSlider;
