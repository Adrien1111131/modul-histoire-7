const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY
const API_URL = 'https://api.x.ai/v1/chat/completions'

import predicats from '../data/predicats'
import * as promptTemplates from './promptTemplates'
import * as introTemplates from './introductionTemplates'
import * as optimizedPrompts from './optimizedPrompts'

const N8N_WEBHOOK_URL = 'https://adrien31.app.n8n.cloud/webhook/c6101c94-785c-4eb3-a7e3-f01568125047';

/**
 * Détecte si l'erreur est liée au quota/rate limit
 * @param {Error} error - Erreur à analyser
 * @returns {boolean} True si c'est une erreur de quota
 */
const isQuotaError = (error) => {
  const errorMessage = error.message.toLowerCase();
  return (
    error.message.includes('429') ||
    errorMessage.includes('too many tokens') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('quota') ||
    errorMessage.includes('exhausted')
  );
};

/**
 * Effectue un appel API avec fallback automatique Grok-4 → Grok-3
 * @param {Array} messages - Messages pour l'API
 * @param {number} temperature - Température pour la génération
 * @param {number} seed - Seed pour la reproductibilité
 * @param {string} functionName - Nom de la fonction appelante (pour logs)
 * @returns {Promise<Object>} Réponse de l'API
 */
const makeAPICallWithFallback = async (messages, temperature, seed, functionName) => {
  // Tentative 1 : Grok-4 (premium)
  try {
    console.log(`[${functionName}] Tentative avec Grok-4-0709`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        messages,
        model: "grok-4-0709",
        stream: false,
        temperature,
        seed
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      const error = new Error(`Erreur API ${response.status}: ${response.statusText} - ${errorData}`);
      
      // Si c'est une erreur de quota, on va essayer le fallback
      if (response.status === 429 || isQuotaError(error)) {
        console.warn(`[${functionName}] Quota Grok-4 atteint, fallback vers Grok-3...`);
        throw error; // On lance l'erreur pour déclencher le fallback
      }
      
      // Pour les autres erreurs, on les log et on les relance
      console.error(`[${functionName}] Erreur API détaillée:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });
      throw error;
    }

    const data = await response.json();
    console.log(`[${functionName}] ✅ Succès avec Grok-4-0709`);
    return data;

  } catch (error) {
    // Si c'est une erreur de quota, on tente le fallback
    if (isQuotaError(error)) {
      console.log(`[${functionName}] 🔄 Fallback vers Grok-3 (grok-beta)`);
      
      try {
        const fallbackResponse = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROK_API_KEY}`
          },
          body: JSON.stringify({
            messages,
            model: "grok-beta", // Grok-3 fallback
            stream: false,
            temperature: temperature * 0.9, // Légèrement plus conservateur
            seed
          })
        });

        if (!fallbackResponse.ok) {
          const fallbackErrorData = await fallbackResponse.text();
          console.error(`[${functionName}] Erreur fallback Grok-3:`, {
            status: fallbackResponse.status,
            statusText: fallbackResponse.statusText,
            body: fallbackErrorData
          });
          throw new Error(`Erreur fallback API ${fallbackResponse.status}: ${fallbackResponse.statusText} - ${fallbackErrorData}`);
        }

        const fallbackData = await fallbackResponse.json();
        console.log(`[${functionName}] ✅ Succès avec fallback Grok-3 (grok-beta)`);
        return fallbackData;

      } catch (fallbackError) {
        console.error(`[${functionName}] ❌ Échec du fallback Grok-3:`, fallbackError);
        throw new Error(`Échec complet: Grok-4 (quota) et Grok-3 (${fallbackError.message})`);
      }
    }
    
    // Pour les autres erreurs, on les relance directement
    throw error;
  }
};

/**
 * Envoie l'histoire générée au webhook n8n
 * @param {string} storyText - Texte de l'histoire
 */
const sendStoryToN8n = async (storyText) => {
  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ story: storyText }),
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi au webhook n8n:', error);
  }
};

/**
 * Nettoie le contenu de l'histoire en supprimant les annotations et analyses
 * @param {string} content - Contenu brut de l'histoire
 * @returns {string} Contenu nettoyé
 */
const cleanStoryContent = (content) => {
  let cleanedContent = content;
  
  // Supprimer les annotations et analyses
  cleanedContent = cleanedContent.replace(/\*\*.*?\*\*/g, ''); // Supprime les marqueurs **texte**
  cleanedContent = cleanedContent.replace(/###.*?\n/g, ''); // Supprime les titres ### titre
  cleanedContent = cleanedContent.replace(/---\n/g, ''); // Supprime les séparateurs ---
  cleanedContent = cleanedContent.replace(/\n\n\n###.*$/s, ''); // Supprime tout ce qui suit un triple saut de ligne suivi de ###
  
  return cleanedContent;
};

/**
 * Génère une histoire basée sur le profil utilisateur (VERSION OPTIMISÉE)
 * @param {Object} userProfile - Profil de l'utilisateur
 * @returns {Promise<string>} Histoire générée
 */
export const generateStory = async (userProfile) => {
  try {
    const { personalInfo, sensoryAnswers, excitationAnswers } = userProfile
    
    // Déterminer le style narratif basé sur les réponses sensorielles
    const dominantStyle = calculateDominantStyle(sensoryAnswers)
    const excitationType = calculateExcitationType(excitationAnswers)

    // Créer un profil utilisateur enrichi pour le système optimisé
    const enrichedProfile = {
      name: personalInfo.name,
      gender: personalInfo.gender,
      orientation: personalInfo.orientation,
      dominantStyle: dominantStyle,
      excitationType: excitationType
    };
    
    // Déterminer le niveau d'érotisme basé sur le ton choisi
    const eroticismLevel = personalInfo.tone === 'doux' ? 1 : 
                          personalInfo.tone === 'passionne' ? 3 : 2;
    
    // Construire le prompt système optimisé
    const systemPrompt = optimizedPrompts.buildOptimizedPrompt(enrichedProfile, 'guided', eroticismLevel);
    
    // Construire le prompt utilisateur optimisé avec les paramètres spécifiques
    let userPrompt = optimizedPrompts.buildUserPrompt({
      name: personalInfo.name,
      gender: personalInfo.gender,
      orientation: personalInfo.orientation,
      readingTime: getLengthInMinutes(personalInfo.length)
    });
    
    // Ajouter les paramètres spécifiques du profil guidé
    userPrompt += `\n\nPARAMÈTRES SPÉCIFIQUES DU PROFIL :
- Tonalité : ${personalInfo.tone} (${getToneDescription(personalInfo.tone)})
- Contexte initial : ${personalInfo.context} (${getContextDescription(personalInfo.context)})
- Longueur souhaitée : ${personalInfo.length} (${getLengthDescription(personalInfo.length)})
- Style dominant : ${dominantStyle}
- Type d'excitation : ${excitationType}

PROGRESSION ADAPTÉE :
1. Ton doux pour poser le contexte initial (${personalInfo.context})
2. Alterner ton sensuel et murmures pour la montée du désir
3. Utiliser ton intense et excité pour les moments passionnés
4. Ton de jouissance pour les moments culminants
5. Terminer par ton doux pour la descente émotionnelle`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    // Ajouter des éléments aléatoires pour éviter la répétition
    const randomSeed = Math.floor(Math.random() * 10000);
    const randomTemperature = 0.7 + (Math.random() * 0.2); // Entre 0.7 et 0.9

    // Utiliser le système de fallback automatique Grok-4 → Grok-3
    const data = await makeAPICallWithFallback(messages, randomTemperature, randomSeed, 'generateStory');
    const content = cleanStoryContent(data.choices[0].message.content);
    
    // Envoi automatique à n8n
    sendStoryToN8n(content);

    return content;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

/**
 * Génère une histoire aléatoire basée sur les préférences de l'utilisateur (VERSION OPTIMISÉE)
 * @param {Object} randomStoryData - Données pour l'histoire aléatoire
 * @returns {Promise<string>} Histoire générée
 */
export const generateRandomStory = async (randomStoryData) => {
  try {
    const { personalInfo, selectedKinks, readingTime = 2, eroticismLevel = 2, dominantStyle, excitationType } = randomStoryData;
    
    // Créer un profil utilisateur enrichi pour le système optimisé
    const userProfile = {
      name: personalInfo.name,
      gender: personalInfo.gender,
      orientation: personalInfo.orientation,
      dominantStyle: dominantStyle || 'VISUEL',
      excitationType: excitationType || 'ÉMOTIONNEL'
    };
    
    // Construire le prompt système optimisé
    const systemPrompt = optimizedPrompts.buildOptimizedPrompt(userProfile, 'random', eroticismLevel);
    
    // Construire le prompt utilisateur optimisé
    const userPrompt = optimizedPrompts.buildUserPrompt({
      name: personalInfo.name,
      gender: personalInfo.gender,
      orientation: personalInfo.orientation,
      selectedKinks: selectedKinks,
      readingTime: readingTime
    });

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    // Ajouter des éléments aléatoires pour éviter la répétition
    const randomSeed = Math.floor(Math.random() * 10000);
    const randomTemperature = 0.7 + (Math.random() * 0.3); // Entre 0.7 et 1.0

    // Utiliser le système de fallback automatique Grok-4 → Grok-3
    const data = await makeAPICallWithFallback(messages, randomTemperature, randomSeed, 'generateRandomStory');
    const content = cleanStoryContent(data.choices[0].message.content);
    
    // Envoi automatique à n8n
    sendStoryToN8n(content);

    return content;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

/**
 * Génère une histoire personnalisée basée sur les choix de l'utilisateur (VERSION OPTIMISÉE)
 * @param {Object} customChoices - Choix personnalisés
 * @param {Object} existingProfile - Profil existant (optionnel)
 * @returns {Promise<string>} Histoire générée
 */
export const generateCustomStory = async (customChoices, existingProfile = null) => {
  try {
    const { situation, personnage, lieu, readingTime = 2, eroticismLevel = 2 } = customChoices;
    
    // Créer un profil utilisateur enrichi pour le système optimisé
    const userProfile = existingProfile ? {
      name: existingProfile.name,
      gender: existingProfile.gender,
      orientation: existingProfile.orientation,
      dominantStyle: existingProfile.dominantStyle || 'VISUEL',
      excitationType: existingProfile.excitationType || 'ÉMOTIONNEL'
    } : {
      dominantStyle: 'VISUEL',
      excitationType: 'ÉMOTIONNEL'
    };
    
    // Construire le prompt système optimisé
    const systemPrompt = optimizedPrompts.buildOptimizedPrompt(userProfile, 'custom', eroticismLevel);
    
    // Construire le prompt utilisateur optimisé
    const userPrompt = optimizedPrompts.buildUserPrompt({
      name: existingProfile?.name || 'l\'auditrice',
      gender: existingProfile?.gender || 'femme',
      orientation: existingProfile?.orientation || 'hétérosexuelle',
      readingTime: readingTime,
      situation: situation.label,
      personnage: personnage.label,
      lieu: lieu.label
    });

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    // Ajouter des éléments aléatoires pour éviter la répétition
    const randomSeed = Math.floor(Math.random() * 10000);
    const randomTemperature = 0.7 + (Math.random() * 0.3); // Entre 0.7 et 1.0

    // Utiliser le système de fallback automatique Grok-4 → Grok-3
    const data = await makeAPICallWithFallback(messages, randomTemperature, randomSeed, 'generateCustomStory');
    const content = cleanStoryContent(data.choices[0].message.content);
    
    // Envoi automatique à n8n
    sendStoryToN8n(content);

    return content;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

/**
 * Génère une histoire basée sur un fantasme libre (VERSION OPTIMISÉE)
 * @param {string} fantasyText - Texte du fantasme
 * @param {Object} existingProfile - Profil existant (optionnel)
 * @param {number} readingTime - Temps de lecture souhaité
 * @param {number} eroticismLevel - Niveau d'érotisme
 * @returns {Promise<string>} Histoire générée
 */
export const generateFreeFantasyStory = async (fantasyText, existingProfile = null, readingTime = 2, eroticismLevel = 2) => {
  try {
    // Créer un profil utilisateur enrichi pour le système optimisé
    const userProfile = existingProfile ? {
      name: existingProfile.name,
      gender: existingProfile.gender,
      orientation: existingProfile.orientation,
      dominantStyle: existingProfile.dominantStyle || 'VISUEL',
      excitationType: existingProfile.excitationType || 'ÉMOTIONNEL'
    } : {
      dominantStyle: 'VISUEL',
      excitationType: 'ÉMOTIONNEL'
    };
    
    // Construire le prompt système optimisé
    const systemPrompt = optimizedPrompts.buildOptimizedPrompt(userProfile, 'free', eroticismLevel);
    
    // Construire le prompt utilisateur optimisé
    const userPrompt = optimizedPrompts.buildUserPrompt({
      name: existingProfile?.name || 'l\'auditrice',
      gender: existingProfile?.gender || 'femme',
      orientation: existingProfile?.orientation || 'hétérosexuelle',
      readingTime: readingTime,
      fantasyText: fantasyText
    });

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    // Ajouter des éléments aléatoires pour éviter la répétition
    const randomSeed = Math.floor(Math.random() * 10000);
    const randomTemperature = 0.7 + (Math.random() * 0.3); // Entre 0.7 et 1.0

    // Utiliser le système de fallback automatique Grok-4 → Grok-3
    const data = await makeAPICallWithFallback(messages, randomTemperature, randomSeed, 'generateFreeFantasyStory');
    const content = cleanStoryContent(data.choices[0].message.content);
    
    // Envoi automatique à n8n
    sendStoryToN8n(content);

    return content;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

/**
 * Calcule le style dominant basé sur les réponses sensorielles
 * @param {Object} answers - Réponses aux questions sensorielles
 * @returns {string} Style dominant
 */
const calculateDominantStyle = (answers = {}) => {
  try {
    // Convertir l'objet de réponses en tableau de valeurs
    const answersArray = Object.values(answers)
    
    if (!answersArray.length) {
      console.warn('Aucune réponse sensorielle trouvée')
      return 'VISUEL'
    }

    // Compter les réponses pour chaque style
    const counts = answersArray.reduce((acc, answer) => {
      acc[answer] = (acc[answer] || 0) + 1
      return acc
    }, {})

    // Trouver le style dominant
    const dominant = Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[0][0]

    // Mapper les lettres aux styles
    const styleMap = {
      'A': 'VISUEL',
      'B': 'SENSORIEL',
      'C': 'AUDITIF'
    }

    return styleMap[dominant] || 'VISUEL'
  } catch (error) {
    console.error('Erreur lors du calcul du style dominant:', error)
    return 'VISUEL'
  }
}

/**
 * Calcule le type d'excitation basé sur les réponses
 * @param {Object} answers - Réponses aux questions d'excitation
 * @returns {string} Type d'excitation
 */
const calculateExcitationType = (answers = {}) => {
  try {
    // Convertir l'objet de réponses en tableau de valeurs
    const answersArray = Object.values(answers)
    
    if (!answersArray.length) {
      console.warn('Aucune réponse d\'excitation trouvée')
      return 'ÉMOTIONNEL'
    }

    const typeMap = {
      'A': 'ÉMOTIONNEL',
      'B': 'IMAGINATIF',
      'C': 'DOMINANCE_DOUCE',
      'D': 'SENSORIEL'
    }

    // Compter les réponses pour chaque type
    const counts = answersArray.reduce((acc, answer) => {
      acc[answer] = (acc[answer] || 0) + 1
      return acc
    }, {})

    // Trouver le type dominant
    const dominant = Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[0][0]

    return typeMap[dominant] || 'ÉMOTIONNEL'
  } catch (error) {
    console.error('Erreur lors du calcul du type d\'excitation:', error)
    return 'ÉMOTIONNEL'
  }
}

/**
 * Obtient la description du ton
 * @param {string} tone - Ton choisi
 * @returns {string} Description du ton
 */
const getToneDescription = (tone) => {
  const descriptions = {
    'doux': 'utilise un ton tendre, affectueux et rassurant',
    'passionne': 'sois intense, ardent et fougueux',
    'mysterieux': 'crée une ambiance énigmatique et séduisante',
    'dominant': 'adopte une posture assurée et dominante mais bienveillante'
  }
  return descriptions[tone] || descriptions['doux']
}

/**
 * Obtient la description du contexte
 * @param {string} context - Contexte choisi
 * @returns {string} Description du contexte
 */
const getContextDescription = (context) => {
  const descriptions = {
    'rencontre': 'une rencontre inattendue qui mène à une connexion immédiate',
    'retrouvailles': 'des retrouvailles passionnées après une séparation',
    'fantasme': 'la réalisation d\'un fantasme longtemps imaginé',
    'quotidien': 'un moment ordinaire qui devient extraordinaire'
  }
  return descriptions[context] || descriptions['rencontre']
}

/**
 * Obtient la description de la longueur
 * @param {string} length - Longueur choisie
 * @returns {string} Description de la longueur
 */
const getLengthDescription = (length) => {
  const descriptions = {
    'short': 'histoire courte et intense (2 minutes de lecture)',
    'medium': 'histoire de longueur moyenne avec développement (3 minutes)',
    'long': 'histoire détaillée et immersive (5 minutes)'
  }
  return descriptions[length] || descriptions['medium']
}

/**
 * Convertit la longueur en minutes
 * @param {string} length - Longueur choisie
 * @returns {number} Temps en minutes
 */
const getLengthInMinutes = (length) => {
  const minutes = {
    'short': 2,
    'medium': 3,
    'long': 5
  }
  return minutes[length] || 5
}

export default {
  generateStory,
  generateRandomStory,
  generateCustomStory,
  generateFreeFantasyStory
}
