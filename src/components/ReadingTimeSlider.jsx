import React from 'react';

const ReadingTimeSlider = ({ min = 2, max = 12, defaultValue = 2, value, onChange }) => {
  // Utiliser soit la valeur fournie, soit la valeur par défaut
  const currentValue = value !== undefined ? value : defaultValue;
  
  return (
    <div className="mb-6 border border-white/10 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="reading-time" className="text-base font-light text-white/90">
          Durée : <span className="text-white font-medium">{currentValue} minutes</span>
        </label>
        <div className="text-sm text-white/70">
          {min} min - {max} min
        </div>
      </div>
      
      <div className="relative w-full h-6 my-4">
        <div 
          className="absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 rounded-full bg-white/10"
        ></div>
        <div
          className="absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#e0c29b] to-[#d5b394]"
          style={{ width: `${(currentValue - min) / (max - min) * 100}%` }}
        ></div>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#e0c29b] rounded-full cursor-pointer"
          style={{ 
            left: `${(currentValue - min) / (max - min) * 100}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 4px rgba(255,255,255,0.3)'
          }}
        >
        </div>
        <input
          id="reading-time"
          type="range"
          min={min}
          max={max}
          value={currentValue}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute w-full h-6 opacity-0 cursor-pointer"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>
      
      <div className="flex justify-between text-sm text-white/70 mt-2 font-light">
        <span>Court</span>
        <span>Moyen</span>
        <span>Long</span>
      </div>
    </div>
  );
};

export default ReadingTimeSlider;
