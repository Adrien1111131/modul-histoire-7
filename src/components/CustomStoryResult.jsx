 import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import storyService from '../services/storyServiceWrapper';
import { VOCAL_MODULE_URL } from '../config/appConfig';

const CustomStoryResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Utiliser un objet vide par défaut pour éviter les erreurs undefined
  const { customChoices = {}, existingProfile = null } = location.state || {};
  
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // Vérifier si customChoices est valide et contient les propriétés nécessaires
    if (!customChoices || !customChoices.situation || !customChoices.personnage || !customChoices.lieu) {
      console.error('CustomStoryResult - Données invalides:', { customChoices, existingProfile });
      setError('Aucune sélection trouvée ou données incomplètes. Veuillez retourner à la sélection.');
      setLoading(false);
      return;
    }
    
    console.log('CustomStoryResult - Données reçues:', { 
      situation: customChoices.situation,
      personnage: customChoices.personnage,
      lieu: customChoices.lieu,
      readingTime: customChoices.readingTime,
      eroticismLevel: customChoices.eroticismLevel,
      existingProfile
    });
    
    generateStory();
  }, []);

  const generateStory = async () => {
    try {
      setLoading(true);
      setError(null);
      setCopySuccess(false);
      
      console.log('CustomStoryResult - Appel API avec:', { 
        situation: customChoices.situation,
        personnage: customChoices.personnage,
        lieu: customChoices.lieu,
        readingTime: customChoices.readingTime,
        eroticismLevel: customChoices.eroticismLevel
      });
      
      const generatedStory = await storyService.generateCustomStory(customChoices, existingProfile);
      console.log('CustomStoryResult - Histoire générée avec succès');
      setStory(generatedStory);
    } catch (err) {
      console.error('Erreur détaillée de génération:', err);
      setError(`Une erreur est survenue lors de la génération de l'histoire: ${err.message}`);
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
              <li>Des données manquantes dans votre sélection</li>
            </ul>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => navigate('/custom-story')}
              className="btn-secondary"
            >
              Retour à la sélection
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
      <div className="question-card">
        <h2 className="text-2xl font-bold mb-6">Votre histoire personnalisée</h2>
        
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate('/custom-story')}
            className="btn-secondary"
          >
            Nouvelle histoire
          </button>
          
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
            className="btn-primary flex items-center justify-center"
          >
            <span role="img" aria-label="headphones" className="mr-2">🎧</span> Générer l'audio
          </button>
        </div>
        
        {customChoices && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-700 mb-2">Vos choix :</h3>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Situation : {customChoices.situation?.label || 'Non spécifiée'}</li>
              <li>Personnage : {customChoices.personnage?.label || 'Non spécifié'}</li>
              <li>Lieu : {customChoices.lieu?.label || 'Non spécifié'}</li>
              {existingProfile && (
                <li>Style narratif : {existingProfile.dominantStyle}</li>
              )}
            </ul>
          </div>
        )}
        
        <div className="prose prose-lg max-w-none mb-6">
          {story.split('\n').map((paragraph, index) => {
            // Mettre en évidence les pauses
            const formattedText = paragraph
              .replace(/\(\.\.\.\)/g, '<span class="text-gray-400">(...)</span>')
              .replace(/\.\.\.\.\./g, '<span class="text-gray-400">.....</span>')
              .replace(/\.\.\./g, '<span class="text-gray-400">...</span>')
              .replace(/;/g, '<span class="text-gray-400">;</span>');

            return (
              <p 
                key={index} 
                className="mb-4 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formattedText }}
              />
            );
          })}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Guide des balises audio :</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-blue-600">[sensuel]</span> - ton sensuel et séduisant</div>
            <div><span className="text-blue-600">[excite]</span> - ton excité et passionné</div>
            <div><span className="text-blue-600">[jouissance]</span> - ton d'extase</div>
            <div><span className="text-blue-600">[murmure]</span> - ton doux et intime</div>
            <div><span className="text-blue-600">[intense]</span> - ton intense et profond</div>
            <div><span className="text-blue-600">[doux]</span> - ton tendre et délicat</div>
            <div className="col-span-2 space-y-1">
              <div><span className="text-gray-400">;</span> - micro-pause entre actions</div>
              <div><span className="text-gray-400">...</span> - pause naturelle</div>
              <div><span className="text-gray-400">.....</span> - pause intense/dramatique</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <div className="space-x-4">
            <button
              onClick={generateStory}
              className="btn-secondary"
            >
              Régénérer
            </button>
            <button
              onClick={handleCopy}
              className={`btn-primary relative ${copySuccess ? 'bg-green-600' : ''}`}
            >
              {copySuccess ? 'Copié !' : 'Copier l\'histoire'}
              {copySuccess && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomStoryResult;
