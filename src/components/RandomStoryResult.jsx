import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import grokApi from '../services/grokApi'
import { VOCAL_MODULE_URL } from '../config/appConfig'
import { logUserAction, ANALYTICS_ACTIONS } from '../services/analyticsService'
import userHistoryService from '../services/userHistoryService'
import profileService from '../services/profileService'

const RandomStoryResult = ({ randomStoryData: propRandomStoryData }) => {
  const navigate = useNavigate()
  const [story, setStory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [randomStoryData, setRandomStoryData] = useState(null)

  useEffect(() => {
    // Récupérer les données de l'histoire aléatoire
    const storedData = localStorage.getItem('randomStoryData')
    
    // Si des données sont passées en props, les utiliser
    // Sinon, essayer de récupérer les données du localStorage
    if (propRandomStoryData) {
      setRandomStoryData(propRandomStoryData)
    } else if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        // Vérifier que les données sont valides
        if (parsedData && typeof parsedData === 'object') {
          setRandomStoryData(parsedData)
          // Nettoyer le localStorage après récupération
          localStorage.removeItem('randomStoryData')
        } else {
          throw new Error('Données invalides')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error)
        setError('Erreur lors de la récupération des données de l\'histoire')
      }
    } else {
      setError('Aucune donnée disponible pour générer une histoire')
    }
  }, [propRandomStoryData])

  useEffect(() => {
    // Générer l'histoire une fois que les données sont disponibles
    if (randomStoryData) {
      generateStory()
    }
  }, [randomStoryData])

  const generateStory = async () => {
    try {
      setLoading(true)
      setError(null)
      setCopySuccess(false)
      
      if (!randomStoryData || !randomStoryData.personalInfo || !randomStoryData.selectedKinks) {
        setError('Données insuffisantes pour générer une histoire. Veuillez retourner à la sélection.')
        setLoading(false)
        return
      }
      
      // S'assurer que toutes les propriétés nécessaires existent
      const safeRandomStoryData = {
        personalInfo: {
          name: randomStoryData.personalInfo.name || 'Utilisateur',
          gender: randomStoryData.personalInfo.gender || 'femme',
          orientation: randomStoryData.personalInfo.orientation || 'hétérosexuelle'
        },
        selectedKinks: Array.isArray(randomStoryData.selectedKinks) ? 
          randomStoryData.selectedKinks : ['Romance', 'Passion'],
        readingTime: randomStoryData.readingTime || 10,
        eroticismLevel: randomStoryData.eroticismLevel || 2,
        dominantStyle: randomStoryData.dominantStyle || 'VISUEL',
        excitationType: randomStoryData.excitationType || 'ÉMOTIONNEL'
      }
      
      const generatedStory = await grokApi.generateRandomStory(safeRandomStoryData)
      setStory(generatedStory)
      
      // Logger l'histoire générée dans l'historique utilisateur
      const currentUserId = profileService.getActiveProfile()
      if (currentUserId && generatedStory) {
        // Enregistrer l'histoire dans l'historique complet
        userHistoryService.logGeneratedStory(currentUserId, {
          type: 'random',
          content: generatedStory,
          readingTime: safeRandomStoryData.readingTime,
          eroticismLevel: safeRandomStoryData.eroticismLevel,
          selectedKinks: safeRandomStoryData.selectedKinks,
          dominantStyle: safeRandomStoryData.dominantStyle,
          excitationType: safeRandomStoryData.excitationType
        })
        
        // Logger les fantasmes sélectionnés
        userHistoryService.logSelectedFantasies(
          currentUserId, 
          safeRandomStoryData.selectedKinks.map(kink => ({ subcategory: kink })),
          'random_story'
        )
        
        // Logger l'action dans analytics
        logUserAction(
          ANALYTICS_ACTIONS.RANDOM_STORY_GENERATED,
          'RandomStoryResult',
          {
            storyLength: generatedStory.length,
            readingTime: safeRandomStoryData.readingTime,
            eroticismLevel: safeRandomStoryData.eroticismLevel,
            kinksCount: safeRandomStoryData.selectedKinks.length,
            selectedKinks: safeRandomStoryData.selectedKinks
          }
        )
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la génération de l\'histoire.')
      console.error('Erreur de génération:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(story)
      .then(() => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
        
        // Logger l'action de copie
        const currentUserId = profileService.getActiveProfile()
        if (currentUserId) {
          logUserAction(
            ANALYTICS_ACTIONS.STORY_COPIED,
            'RandomStoryResult',
            {
              storyType: 'random',
              storyLength: story.length
            }
          )
        }
      })
      .catch(err => {
        console.error('Erreur de copie:', err)
        alert('Impossible de copier l\'histoire. Veuillez réessayer.')
      })
  }

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
    )
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
              onClick={() => navigate('/random-story-generator')}
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
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="question-card">
        <h2 className="text-2xl font-bold mb-6">Votre histoire personnalisée</h2>
        
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate('/random-story-generator')}
            className="btn-secondary"
          >
            Nouvelle histoire aléatoire
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
              onClick={() => {
                // Logger l'action de régénération
                const currentUserId = profileService.getActiveProfile()
                if (currentUserId) {
                  logUserAction(
                    ANALYTICS_ACTIONS.STORY_REGENERATED,
                    'RandomStoryResult',
                    {
                      storyType: 'random',
                      previousStoryLength: story.length
                    }
                  )
                }
                generateStory()
              }}
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
  )
}

export default RandomStoryResult
