import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../services/profileService';
import ReadingTimeSlider from './ReadingTimeSlider';
import EroticismLevelSlider from './EroticismLevelSlider';
import fondStart from '/fond start.png';
import { logUserAction, ANALYTICS_ACTIONS } from '../services/analyticsService';

const FreeFantasyGenerator = () => {
  const navigate = useNavigate();
  const [fantasyText, setFantasyText] = useState('');
  const [readingTime, setReadingTime] = useState(2);
  const [eroticismLevel, setEroticismLevel] = useState(2); // Niveau modéré par défaut
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!fantasyText.trim()) {
      setError('Veuillez décrire votre fantasme avant de continuer.');
      return;
    }
    
    if (fantasyText.trim().length < 20) {
      setError('Veuillez fournir une description plus détaillée pour obtenir une meilleure histoire.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Récupérer le profil s'il existe
    const activeProfileId = profileService.getActiveProfile();
    const existingProfile = activeProfileId ? profileService.getProfileById(activeProfileId) : null;
    
    // Log du fantasme libre écrit
    logUserAction(
      ANALYTICS_ACTIONS.FREE_FANTASY_WRITTEN,
      'FreeFantasyGenerator',
      {
        fantasyText: fantasyText.substring(0, 200) + (fantasyText.length > 200 ? '...' : ''), // Limiter à 200 caractères pour la confidentialité
        fantasyLength: fantasyText.length,
        readingTime,
        eroticismLevel,
        hasProfile: !!existingProfile
      }
    );
    
    // Naviguer vers la page de résultat avec le texte du fantasme et le temps de lecture
    navigate('/free-fantasy-result', { 
      state: { 
        fantasyText,
        existingProfile,
        readingTime,
        eroticismLevel
      } 
    });
  };

  const handleTextChange = (e) => {
    setFantasyText(e.target.value);
    if (error) setError('');
  };

  const placeholderSuggestions = [
    "Je fantasme sur une rencontre imprévue dans un ascenseur qui tombe en panne...",
    "J'aimerais être surprise par mon partenaire qui m'attend dans la chambre d'hôtel...",
    "Je rêve d'une aventure avec un inconnu lors d'un voyage...",
    "J'imagine une soirée où je suis le centre d'attention de plusieurs personnes...",
    "Je voudrais vivre une expérience de soumission consentie avec quelqu'un qui sait exactement quoi faire..."
  ];

  const randomPlaceholder = placeholderSuggestions[Math.floor(Math.random() * placeholderSuggestions.length)];

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
            <h2 className="text-3xl font-serif text-center mb-4">Libre</h2>
            
            {error && (
              <div className="bg-red-500/50 border border-red-400 text-white px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
            
            <p className="text-amber-100 text-sm mb-6">
              Transforme ton idée en une histoire érotique immersive en décrivant librement ton fantasme.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fantasy-text" className="block text-amber-200 mb-2">
                  Ton fantasme en détail
                </label>
                <textarea
                  id="fantasy-text"
                  rows={8}
                  className={`w-full p-3 bg-amber-200/30 border rounded-md text-white placeholder-amber-200/70 focus:outline-none focus:ring-2 focus:ring-amber-300 ${error ? 'border-red-400' : 'border-amber-300/50'}`}
                  placeholder={randomPlaceholder}
                  value={fantasyText}
                  onChange={handleTextChange}
                ></textarea>
              </div>

              <div className="bg-amber-800/50 border border-amber-700/50 rounded-md p-4">
                <h3 className="text-sm font-medium text-amber-200 mb-2">Suggestions pour t'aider :</h3>
                <ul className="list-disc list-inside text-amber-100 space-y-1 text-sm">
                  <li>Décris le lieu, l'ambiance et les personnes impliquées</li>
                  <li>Précise ce qui t'excite particulièrement dans cette situation</li>
                  <li>Mentionne le niveau d'intensité que tu recherches</li>
                  <li>Indique si tu préfères être dominant(e) ou soumis(e)</li>
                  <li>N'hésite pas à être spécifique sur tes désirs</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium text-amber-200 mb-3">
                  Temps de lecture souhaité
                </h3>
                <ReadingTimeSlider 
                  value={readingTime}
                  onChange={setReadingTime}
                />
              </div>

              <div>
                <h3 className="text-xl font-medium text-amber-200 mb-3">
                  Niveau d'érotisme
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Génération...' : 'Écrire'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeFantasyGenerator;
