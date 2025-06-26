import React, { useState } from 'react';
import ReadingTimeSlider from './ReadingTimeSlider';
import EroticismLevelSlider from './EroticismLevelSlider';

const MysterySettingsModal = ({ initialReadingTime = 2, initialEroticismLevel = 2, onClose, onSubmit }) => {
  const [readingTime, setReadingTime] = useState(initialReadingTime);
  const [eroticismLevel, setEroticismLevel] = useState(initialEroticismLevel);

  const handleSubmit = () => {
    onSubmit({ readingTime, eroticismLevel });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="bg-amber-700/90 rounded-lg p-6 max-w-md w-full mx-4 border border-amber-500 shadow-xl">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-medium text-white mb-2">Paramètres de l'histoire</h3>
          <p className="text-amber-200 text-sm">Personnalisez votre expérience mystérieuse</p>
        </div>
        
        <div className="space-y-6">
          {/* Curseur de temps de lecture */}
          <div>
            <h4 className="text-lg font-medium text-amber-200 mb-3">Temps de lecture</h4>
            <ReadingTimeSlider 
              value={readingTime}
              onChange={setReadingTime}
            />
          </div>

          {/* Curseur de niveau d'érotisme */}
          <div>
            <h4 className="text-lg font-medium text-amber-200 mb-3">Niveau d'érotisme</h4>
            <EroticismLevelSlider 
              value={eroticismLevel}
              onChange={setEroticismLevel}
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
          >
            Annuler
          </button>
          
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-400 transition-colors"
          >
            Lancer l'histoire
          </button>
        </div>
      </div>
    </div>
  );
};

export default MysterySettingsModal;
