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
  const [progress, setProgress] = useState(0)

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

  // Effet pour la barre de progression (60 secondes)
  useEffect(() => {
    if (loading) {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + (100 / 60) // Incrémente sur 60 secondes
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [loading])

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
      <div className="elegant-loading-screen">
        <div className="elegant-loading-card">
          <h2 className="loading-title">
            Ton histoire est en train de naître, lentement, intensément.
          </h2>
          
          <p className="loading-subtitle">
            Cela peut prendre quelques minutes...
          </p>
          
          <p className="loading-warning">
            Surtout ne ferme pas l'application, ta patience sera récompensée...
          </p>
          
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {Math.round(Math.min(progress, 100))}% - Création en cours...
            </p>
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
      <div className="question-card text-center">
        <h2 className="text-2xl font-bold mb-8">Votre histoire personnalisée</h2>
        
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
  )
}

export default RandomStoryResult
