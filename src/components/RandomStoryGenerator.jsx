import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KinkSelector from './KinkSelector';
import ReadingTimeSlider from './ReadingTimeSlider';
import EroticismLevelSlider from './EroticismLevelSlider';
import Header from './Header';
import fondStart from '/fond start.png';
import profileService from '../services/profileService';
import grokApi from '../services/grokApi';

const RandomStoryGenerator = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [selectedKinks, setSelectedKinks] = useState([]);
  const [readingTime, setReadingTime] = useState(2);
  const [eroticismLevel, setEroticismLevel] = useState(2);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeProfile, setActiveProfile] = useState(null);

  useEffect(() => {
    const profile = profileService.getActiveProfileData();
    if (profile) {
      setActiveProfile(profile);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedKinks.length === 0) {
      setError('Veuillez sélectionner au moins une catégorie');
      return;
    }
    
    const defaultProfile = {
      name: "Utilisateur",
      gender: "femme",
      orientation: "hétérosexuelle",
      dominantStyle: "VISUEL",
      excitationType: "ÉMOTIONNEL",
      tone: "doux",
      length: "medium"
    };
    
    const profileToUse = activeProfile || defaultProfile;
    
    const randomStoryData = {
      personalInfo: {
        name: profileToUse.name,
        gender: profileToUse.gender,
        orientation: profileToUse.orientation || "hétérosexuelle"
      },
      selectedKinks,
      readingTime,
      eroticismLevel,
      dominantStyle: profileToUse.dominantStyle || "VISUEL",
      excitationType: profileToUse.excitationType || "ÉMOTIONNEL",
      tone: profileToUse.tone || "doux",
      length: profileToUse.length || "medium"
    };
    
    onSubmit(randomStoryData);
    navigate('/random-story-result');
  };

  const handleGenerateRandom = async () => {
    try {
      setLoading(true);
      setError('');

      const defaultProfile = {
        name: "Utilisateur",
        gender: "femme",
        orientation: "hétérosexuelle",
        dominantStyle: "VISUEL",
        excitationType: "ÉMOTIONNEL",
        tone: "doux",
        length: "medium"
      };
      
      const profileToUse = activeProfile || defaultProfile;

      const allKinks = [
        'Romance', 'Passion', 'Sensualité', 'Désir', 'Séduction',
        'Fantasme', 'Intimité', 'Plaisir', 'Érotisme', 'Tension'
      ];
      const numKinks = Math.floor(Math.random() * 3) + 2;
      const randomKinks = [];
      
      while (randomKinks.length < numKinks && allKinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * allKinks.length);
        randomKinks.push(allKinks[randomIndex]);
        allKinks.splice(randomIndex, 1);
      }

      const randomStoryData = {
        personalInfo: {
          name: profileToUse.name,
          gender: profileToUse.gender,
          orientation: profileToUse.orientation || 'hétérosexuelle'
        },
        selectedKinks: randomKinks,
        readingTime: Math.floor(Math.random() * 3) + 1,
        eroticismLevel: Math.floor(Math.random() * 3) + 1,
        dominantStyle: profileToUse.dominantStyle || "VISUEL",
        excitationType: profileToUse.excitationType || "ÉMOTIONNEL",
        tone: profileToUse.tone || 'doux',
        length: profileToUse.length || 'medium'
      };

      onSubmit(randomStoryData);
      navigate('/random-story-result');
    } catch (error) {
      console.error('Erreur lors de la génération aléatoire:', error);
      setError('Une erreur est survenue lors de la génération de l\'histoire aléatoire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-700/20">
      <Header />
      <div className="flex flex-col items-center justify-start py-4 animate-fadeIn">
        <div className="w-full max-w-md mx-auto rounded-lg shadow-lg my-4 scrollable-card transform transition-all duration-500 ease-in-out hover:shadow-2xl">
          <div className="text-white relative">
            <div className="absolute inset-0 z-0">
              <img src={fondStart} alt="Fond" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
            
            <div className="relative z-10 p-6">
              <h2 className="text-4xl font-serif text-center mb-4 text-amber-100 drop-shadow-lg">Sélectionnez vos fantasmes</h2>
              
              {error && (
                <div className="bg-red-500/70 border border-red-400 text-white px-4 py-3 rounded mb-6 shadow-md">
                  {error}
                </div>
              )}
              
              <div>
                
                <KinkSelector 
                  selectedKinks={selectedKinks} 
                  setSelectedKinks={setSelectedKinks}
                />
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-amber-200 mb-3 drop-shadow-md">Durée</h3>
                  <p className="text-amber-100 text-sm mb-3">
                    Choisissez la durée de lecture souhaitée pour votre histoire.
                  </p>
                  
                  <ReadingTimeSlider 
                    value={readingTime}
                    onChange={setReadingTime}
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-amber-200 mb-3 drop-shadow-md">Intensité</h3>
                  <p className="text-amber-100 text-sm mb-3">
                    Ajustez l'intensité et le vocabulaire de votre histoire.
                  </p>
                  
                  <EroticismLevelSlider 
                    value={eroticismLevel}
                    onChange={setEroticismLevel}
                  />
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#e0c29b] via-[#d5b394] to-[#b39274] text-black rounded-full font-medium tracking-wide hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:from-[#d5b394] hover:to-[#b39274] backdrop-blur-sm border border-white/10"
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

export default RandomStoryGenerator;
