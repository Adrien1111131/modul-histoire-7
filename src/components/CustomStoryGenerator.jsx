import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storyOptions } from '../data/storyOptions';
import profileService from '../services/profileService';
import ReadingTimeSlider from './ReadingTimeSlider';
import EroticismLevelSlider from './EroticismLevelSlider';
import fondStart from '/fond start.png';

const CustomStoryGenerator = () => {
  const navigate = useNavigate();
  const [selectedSituation, setSelectedSituation] = useState('');
  const [selectedPersonnage, setSelectedPersonnage] = useState('');
  const [selectedLieu, setSelectedLieu] = useState('');
  const [readingTime, setReadingTime] = useState(2);
  const [eroticismLevel, setEroticismLevel] = useState(2); // Niveau modéré par défaut

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isComplete) {
      const customChoices = {
        situation: storyOptions.situations.find(s => s.id === selectedSituation),
        personnage: storyOptions.personnages.find(p => p.id === selectedPersonnage),
        lieu: storyOptions.lieux.find(l => l.id === selectedLieu),
        readingTime,
        eroticismLevel
      };
      
      // Récupérer le profil s'il existe
      const activeProfileId = profileService.getActiveProfile();
      const existingProfile = activeProfileId ? profileService.getProfileById(activeProfileId) : null;
      
      navigate('/custom-story-result', { 
        state: { 
          customChoices,
          existingProfile 
        } 
      });
    }
  };

  const isComplete = selectedSituation && selectedPersonnage && selectedLieu;

  return (
    <div className="flex flex-col items-center justify-start py-4 bg-amber-700/20">
      <div className="w-full max-w-md mx-auto border border-blue-400 rounded-lg shadow-lg my-4 scrollable-card">
        <div className="text-white relative">
          {/* Image de fond avec overlay pour améliorer la lisibilité */}
          <div className="absolute inset-0 z-0">
            <img src={fondStart} alt="Fond" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          
          <div className="relative z-10 p-6">
            <h2 className="text-3xl font-serif text-center mb-4">Guidée</h2>
            
            <p className="text-amber-100 text-sm mb-6">
              Laisse-toi guider selon l'ambiance et la situation que tu choisis pour créer une histoire personnalisée.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question 1 - Situation */}
              <div>
                <h3 className="text-xl font-medium text-amber-200 mb-3">
                  1. Quelle situation t'excite le plus ?
                </h3>
                <div className="space-y-2">
                  {storyOptions.situations.map(option => (
                    <label 
                      key={option.id} 
                      className={`flex items-start p-3 rounded-md cursor-pointer ${
                        selectedSituation === option.id 
                          ? 'bg-amber-500/30 border border-amber-400/70' 
                          : 'hover:bg-amber-200/20 border border-transparent'
                      }`}
                    >
                      <input
                        type="radio"
                        name="situation"
                        value={option.id}
                        checked={selectedSituation === option.id}
                        onChange={() => setSelectedSituation(option.id)}
                        className="mt-1 text-amber-500 border-amber-300/50 focus:ring-amber-500"
                      />
                      <span className="ml-3 text-gray-200">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 2 - Personnage */}
              <div>
                <h3 className="text-xl font-medium text-amber-200 mb-3">
                  2. Qui te fait perdre le contrôle ?
                </h3>
                <div className="space-y-2">
                  {storyOptions.personnages.map(option => (
                    <label 
                      key={option.id} 
                      className={`flex items-start p-3 rounded-md cursor-pointer ${
                        selectedPersonnage === option.id 
                          ? 'bg-amber-500/30 border border-amber-400/70' 
                          : 'hover:bg-amber-200/20 border border-transparent'
                      }`}
                    >
                      <input
                        type="radio"
                        name="personnage"
                        value={option.id}
                        checked={selectedPersonnage === option.id}
                        onChange={() => setSelectedPersonnage(option.id)}
                        className="mt-1 text-amber-500 border-amber-300/50 focus:ring-amber-500"
                      />
                      <span className="ml-3 text-gray-200">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 3 - Lieu */}
              <div>
                <h3 className="text-xl font-medium text-amber-200 mb-3">
                  3. Où aimerais-tu succomber ?
                </h3>
                <div className="space-y-2">
                  {storyOptions.lieux.map(option => (
                    <label 
                      key={option.id} 
                      className={`flex items-start p-3 rounded-md cursor-pointer ${
                        selectedLieu === option.id 
                          ? 'bg-amber-500/30 border border-amber-400/70' 
                          : 'hover:bg-amber-200/20 border border-transparent'
                      }`}
                    >
                      <input
                        type="radio"
                        name="lieu"
                        value={option.id}
                        checked={selectedLieu === option.id}
                        onChange={() => setSelectedLieu(option.id)}
                        className="mt-1 text-amber-500 border-amber-300/50 focus:ring-amber-500"
                      />
                      <span className="ml-3 text-gray-200">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 4 - Temps de lecture */}
              <div>
                <h3 className="text-xl font-medium text-amber-200 mb-3">
                  4. Combien de temps veux-tu que dure ton histoire ?
                </h3>
                <ReadingTimeSlider 
                  value={readingTime}
                  onChange={setReadingTime}
                />
              </div>

              <div>
                <h3 className="text-xl font-medium text-amber-200 mb-3">
                  5. Quel niveau d'érotisme souhaites-tu ?
                </h3>
                <EroticismLevelSlider 
                  value={eroticismLevel}
                  onChange={setEroticismLevel}
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-400 transition-colors"
                  disabled={!isComplete}
                >
                  Choisir
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomStoryGenerator;
