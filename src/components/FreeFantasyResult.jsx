import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import grokApi from '../services/grokApi';
import { VOCAL_MODULE_URL } from '../config/appConfig';

const FreeFantasyResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Utiliser des valeurs par défaut pour éviter les erreurs undefined
  const { fantasyText = '', existingProfile = null, eroticismLevel = 2 } = location.state || {};
  
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!fantasyText) {
      setError('Aucun fantasme trouvé. Veuillez retourner à la saisie.');
      setLoading(false);
      return;
    }
    
    generateStory();
  }, []);

  const generateStory = async () => {
    try {
      setLoading(true);
      setError(null);
      setCopySuccess(false);
      
      // Récupérer le temps de lecture s'il existe dans l'état
      const readingTime = location.state?.readingTime || 10; 
      
      // Vérifier que le texte du fantasme n'est pas vide
      if (!fantasyText || fantasyText.trim() === '') {
        setError('Le texte du fantasme est vide. Veuillez retourner à la saisie.');
        setLoading(false);
        return;
      }
      
      // Créer un profil sécurisé si existingProfile est fourni
      const safeProfile = existingProfile ? {
        name: existingProfile.name || 'Utilisateur',
        gender: existingProfile.gender || 'femme',
        orientation: existingProfile.orientation || 'hétérosexuelle',
        dominantStyle: existingProfile.dominantStyle || 'VISUEL',
        excitationType: existingProfile.excitationType || 'ÉMOTIONNEL',
        tone: existingProfile.tone || 'doux',
        length: existingProfile.length || 'medium'
      } : null;
      
      const generatedStory = await grokApi.generateFreeFantasyStory(fantasyText, safeProfile, readingTime, eroticismLevel);
      setStory(generatedStory);
    } catch (err) {
      setError('Une erreur est survenue lors de la génération de l\'histoire.');
      console.error('Erreur de génération:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(story)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Erreur de copie:', err);
        alert('Impossible de copier l\'histoire. Veuillez réessayer.');
      });
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="question-card text-center">
          <div className="space-y-6">
            <span className="text-4xl heart-spin inline-block">❤️</span>
            <h2 className="text-2xl font-bold">Création de votre histoire en cours...</h2>
            <div className="typing-container">
              <p className="typing-text">Cela peut prendre quelques instants</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="question-card">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Une erreur est survenue</h2>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-700">
              {error}
            </p>
            <ul className="list-disc list-inside mt-2 text-red-600">
              <li>Une erreur de connexion avec notre service</li>
              <li>Un problème temporaire avec l'API</li>
              <li>Des données manquantes dans votre description</li>
            </ul>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => navigate('/free-fantasy')}
              className="btn-secondary"
            >
              Retour à la saisie
            </button>
            <button
              onClick={generateStory}
              className="btn-primary"
            >
              Réessayer la génération
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="question-card text-center">
        <h2 className="text-2xl font-bold mb-8">Votre fantasme personnalisé</h2>
        
        <div className="flex justify-center">
          <button
            onClick={async () => {
              try {
                // Copier le texte dans le presse-papiers
                await navigator.clipboard.writeText(story);
                
                // Afficher un feedback visuel temporaire
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 1000);
                
                // Rediriger vers le module vocal dans le même onglet
                window.location.href = VOCAL_MODULE_URL;
              } catch (err) {
                console.error('Erreur lors de la copie:', err);
                alert('Impossible de copier l\'histoire. Veuillez réessayer.');
              }
            }}
            className="btn-primary flex items-center justify-center text-lg px-8 py-4"
          >
            <span role="img" aria-label="headphones" className="mr-3 text-xl">🎧</span> Écouter l'audio
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeFantasyResult;
