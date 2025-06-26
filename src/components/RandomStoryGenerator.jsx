import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KinkSelector from './KinkSelector';
import ReadingTimeSlider from './ReadingTimeSlider';
import EroticismLevelSlider from './EroticismLevelSlider';
import fondStart from '/fond start.png';
import profileService from '../services/profileService';
import grokApi from '../services/grokApi';

const RandomStoryGenerator = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [selectedKinks, setSelectedKinks] = useState([]);
  const [readingTime, setReadingTime] = useState(2);
  const [eroticismLevel, setEroticismLevel] = useState(2); // Niveau modéré par défaut
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeProfile, setActiveProfile] = useState(null);

  useEffect(() => {
    // Récupérer le profil actif au chargement du composant
    const profile = profileService.getActiveProfileData();
    if (profile) {
      setActiveProfile(profile);
    }
    // Ne pas afficher d'erreur si aucun profil n'est trouvé
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (selectedKinks.length === 0) {
      setError('Veuillez sélectionner au moins une catégorie');
      return;
    }
    
    // Créer un profil par défaut si aucun profil actif n'est trouvé
    const defaultProfile = {
      name: "Utilisateur",
      gender: "femme",
      orientation: "hétérosexuelle",
      dominantStyle: "VISUEL",
      excitationType: "ÉMOTIONNEL",
      tone: "doux",
      length: "medium"
    };
    
    // Utiliser le profil actif ou le profil par défaut
    const profileToUse = activeProfile || defaultProfile;
    
    // Soumettre les données
    const randomStoryData = {
      personalInfo: {
        name: profileToUse.name,
        gender: profileToUse.gender,
        orientation: profileToUse.orientation || "hétérosexuelle"
      },
      selectedKinks,
      readingTime,
      eroticismLevel,
      // Ajouter les informations du profil
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

      // Créer un profil par défaut si aucun profil actif n'est trouvé
      const defaultProfile = {
        name: "Utilisateur",
        gender: "femme",
        orientation: "hétérosexuelle",
        dominantStyle: "VISUEL",
        excitationType: "ÉMOTIONNEL",
        tone: "doux",
        length: "medium"
      };
      
      // Utiliser le profil actif ou le profil par défaut
      const profileToUse = activeProfile || defaultProfile;

      // Générer des kinks aléatoires (entre 2 et 4)
      const allKinks = [
        'Romance', 'Passion', 'Sensualité', 'Désir', 'Séduction',
        'Fantasme', 'Intimité', 'Plaisir', 'Érotisme', 'Tension'
      ];
      const numKinks = Math.floor(Math.random() * 3) + 2; // 2 à 4 kinks
      const randomKinks = [];
      
      // Sélectionner des kinks aléatoires sans répétition
      while (randomKinks.length < numKinks && allKinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * allKinks.length);
        randomKinks.push(allKinks[randomIndex]);
        allKinks.splice(randomIndex, 1);
      }

      // Créer les données pour l'histoire aléatoire
      const randomStoryData = {
        personalInfo: {
          name: profileToUse.name,
          gender: profileToUse.gender,
          orientation: profileToUse.orientation || 'hétérosexuelle'
        },
        selectedKinks: randomKinks,
        readingTime: Math.floor(Math.random() * 3) + 1, // 1 à 3 minutes
        eroticismLevel: Math.floor(Math.random() * 3) + 1, // Niveau d'érotisme aléatoire (1-3)
        dominantStyle: profileToUse.dominantStyle || "VISUEL",
        excitationType: profileToUse.excitationType || "ÉMOTIONNEL",
        tone: profileToUse.tone || 'doux',
        length: profileToUse.length || 'medium'
      };

      // Soumettre les données
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
    <div className="flex flex-col items-center justify-start py-4 bg-amber-700/20">
      <div className="w-full max-w-md mx-auto border border-amber-400 rounded-lg shadow-lg my-4 scrollable-card">
        <div className="text-white relative">
          {/* Image de fond avec overlay pour améliorer la lisibilité */}
          <div className="absolute inset-0 z-0">
            <img src={fondStart} alt="Fond" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50"></div> {/* Overlay plus foncé pour meilleure lisibilité */}
          </div>
          
          <div className="relative z-10 p-6">
            <h2 className="text-4xl font-serif text-center mb-4 text-amber-100 drop-shadow-lg">Fantasmes</h2>
            
            {error && (
              <div className="bg-red-500/70 border border-red-400 text-white px-4 py-3 rounded mb-6 shadow-md">
                {error}
              </div>
            )}
            
            <p className="text-amber-100 text-base mb-6 font-medium">
              Créez une histoire sensuelle totalement imprévisible en sélectionnant vos préférences.
            </p>
            
            {activeProfile ? (
              <div className="bg-amber-800/50 p-4 rounded-lg mb-6 border border-amber-500/30">
                <h3 className="text-xl font-medium text-amber-200 mb-2">Profil utilisé</h3>
                <p className="text-amber-100">
                  <span className="font-semibold">{activeProfile.name}</span> ({activeProfile.gender})
                </p>
              </div>
            ) : (
              <div className="bg-amber-800/50 p-4 rounded-lg mb-6 border border-amber-500/30">
                <h3 className="text-xl font-medium text-amber-200 mb-2">Aucun profil utilisé</h3>
                <p className="text-amber-100">
                  Vous pouvez continuer sans profil, mais pour une expérience personnalisée, 
                  <a href="/personal-info" className="text-amber-300 underline ml-1">créez un profil</a>.
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-amber-200 mb-3 drop-shadow-md">Sélection des Catégories</h3>
                <p className="text-amber-100 text-sm mb-3">
                  Sélectionnez les catégories qui vous intéressent pour votre histoire.
                </p>
                
                <KinkSelector 
                  selectedKinks={selectedKinks} 
                  setSelectedKinks={setSelectedKinks} 
                />
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-amber-200 mb-3 drop-shadow-md">Temps de Lecture</h3>
                <p className="text-amber-100 text-sm mb-3">
                  Choisissez la durée de lecture souhaitée pour votre histoire.
                </p>
                
                <ReadingTimeSlider 
                  value={readingTime}
                  onChange={setReadingTime}
                />
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-amber-200 mb-3 drop-shadow-md">Niveau d'Érotisme</h3>
                <p className="text-amber-100 text-sm mb-3">
                  Ajustez l'intensité et le vocabulaire de votre histoire.
                </p>
                
                <EroticismLevelSlider 
                  value={eroticismLevel}
                  onChange={setEroticismLevel}
                />
              </div>
              
              <div className="flex flex-col space-y-4 pt-4">
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => navigate('/home')}
                    className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors shadow-md"
                  >
                    Retour
                  </button>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-400 transition-colors shadow-md"
                  >
                    Lancer
                  </button>
                </div>
                
                {/* Le bouton "Générer une histoire aléatoire avec mon profil" a été supprimé */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomStoryGenerator;
