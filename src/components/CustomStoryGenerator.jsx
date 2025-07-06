import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storyOptions } from '../data/storyOptions';
import profileService from '../services/profileService';
import ReadingTimeSlider from './ReadingTimeSlider';
import EroticismLevelSlider from './EroticismLevelSlider';
import Header from './Header';
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
    <div className="min-h-screen bg-amber-700/20">
      <Header />
      <div className="flex flex-col items-center justify-start py-4 animate-fadeIn">
      <div className="w-full max-w-md mx-auto border border-blue-400 rounded-lg shadow-lg my-4 scrollable-card transform transition-all duration-500 ease-in-out hover:shadow-2xl">
        <div className="text-white relative">
          {/* Image de fond avec overlay pour améliorer la lisibilité */}
          <div className="absolute inset-0 z-0">
            <img src={fondStart} alt="Fond" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          
          <div className="relative z-10 p-6">
            <p className="text-amber-100 text-xl mb-8 text-center font-medium leading-relaxed">
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
                      className={`flex items-start p-3 rounded-md cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
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

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#e0c29b] via-[#d5b394] to-[#b39274] text-white rounded-full font-medium tracking-wide hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:from-[#d5b394] hover:to-[#b39274] backdrop-blur-sm border border-white/10"
                  disabled={!isComplete}
                >
                  <span className="flex items-center">
                    Crée mon histoire
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
            </div>
    </div>
        </div>
      </div>
    </div>
  );
};

export default CustomStoryGenerator;
