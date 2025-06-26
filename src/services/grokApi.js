const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY
const API_URL = 'https://api.x.ai/v1/chat/completions'

import predicats from '../data/predicats'
import * as promptTemplates from './promptTemplates'
import * as introTemplates from './introductionTemplates'

const N8N_WEBHOOK_URL = 'https://adrien31.app.n8n.cloud/webhook/c6101c94-785c-4eb3-a7e3-f01568125047';

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
 * Génère une histoire basée sur le profil utilisateur
 * @param {Object} userProfile - Profil de l'utilisateur
 * @returns {Promise<string>} Histoire générée
 */
export const generateStory = async (userProfile) => {
  try {
    const { personalInfo, sensoryAnswers, excitationAnswers } = userProfile
    
    // Déterminer le style narratif basé sur les réponses sensorielles
    const dominantStyle = calculateDominantStyle(sensoryAnswers)
    const excitationType = calculateExcitationType(excitationAnswers)

    // Construire le prompt système
    const systemPrompt = `
      ${promptTemplates.baseInstructions}

      PROFIL DE L'AUDITRICE :
      - Style dominant : ${dominantStyle.toLowerCase()}
      - Type d'excitation : ${excitationType.toLowerCase()}
      
      ${promptTemplates.narrativeStructure}
      ${promptTemplates.getIntroductionInstructions({
        type: personalInfo.context || 'rencontre',
        dominantStyle: dominantStyle.toLowerCase(),
        name: personalInfo.name
      })}
      ${promptTemplates.phoneticInstructions}
      ${promptTemplates.hypnoticTechniques}
      ${promptTemplates.eroticVocabulary}
      ${promptTemplates.getNarrationInstructions(personalInfo.name)}
      ${promptTemplates.authenticityRules}
      ${promptTemplates.progressionInstructions}
      ${promptTemplates.styleExamples}
      
      EXEMPLE D'INTRODUCTION SPÉCIFIQUE :
      ${introTemplates.generateCompleteIntroduction({
        type: personalInfo.context || 'rencontre',
        dominantStyle: dominantStyle.toLowerCase(),
        name: personalInfo.name
      })}
    `;

    // Construire le prompt utilisateur
    const userPrompt = `
      Crée une histoire érotique sensuelle pour ${personalInfo.name}, 
      qui s'identifie comme ${personalInfo.gender} et est ${personalInfo.orientation}. 
      
      PARAMÈTRES SPÉCIFIQUES :
      - Tonalité : ${personalInfo.tone} (${getToneDescription(personalInfo.tone)})
      - Contexte initial : ${personalInfo.context} (${getContextDescription(personalInfo.context)})
      - Longueur souhaitée : ${personalInfo.length} (${getLengthDescription(personalInfo.length)})
      
      EXEMPLES DE PHRASES À INTÉGRER :
      Tu mérites ça (...) Chaque frisson (...) Chaque caresse
      J'ai tellement envie de toi (...) Mais je veux que tu le ressentes, vraiment
      Tu veux venir pour moi, mon amour ? (...) Vas-y (...) Laisse-toi aller
      
      PROGRESSION :
      1. Ton doux pour poser le contexte initial (${personalInfo.context})
      2. Alterner ton sensuel et murmures pour la montée du désir
      3. Utiliser ton intense et excité pour les moments passionnés
      4. Ton de jouissance pour les moments culminants
      5. Terminer par ton doux pour la descente émotionnelle
      
      N'oublie pas d'utiliser (...) pour les pauses naturelles dans le texte.
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    // Ajouter des éléments aléatoires pour éviter la répétition
    const randomSeed = Math.floor(Math.random() * 10000);
    const randomTemperature = 0.7 + (Math.random() * 0.2); // Entre 0.7 et 0.9

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        messages,
        model: "grok-3-latest",
        stream: false,
        temperature: randomTemperature,
        seed: randomSeed
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de l\'histoire');
    }

    const data = await response.json();
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
 * Génère une histoire aléatoire basée sur les préférences de l'utilisateur
 * @param {Object} randomStoryData - Données pour l'histoire aléatoire
 * @returns {Promise<string>} Histoire générée
 */
export const generateRandomStory = async (randomStoryData) => {
  try {
    const { personalInfo, selectedKinks, readingTime = 2, eroticismLevel = 2 } = randomStoryData;
    
    // Obtenir les instructions d'érotisme
    const eroticismInstructions = promptTemplates.getEroticismInstructions(eroticismLevel);

    // Construire le prompt système
    const systemPrompt = `
      ${promptTemplates.baseInstructions}
      
      ${eroticismInstructions}

      CATÉGORIES SÉLECTIONNÉES :
      ${selectedKinks.join(', ')}
      
      TEMPS DE LECTURE SOUHAITÉ : ${readingTime} minutes
      
      ${promptTemplates.narrativeStructure}
      ${promptTemplates.getIntroductionInstructions({
        type: 'fantasme',
        dominantStyle: 'visuel',
        name: personalInfo.name
      })}
      ${promptTemplates.phoneticInstructions}
      ${promptTemplates.progressionInstructions}
      ${promptTemplates.styleExamples}
      
      EXEMPLE D'INTRODUCTION SPÉCIFIQUE :
      ${introTemplates.generateCompleteIntroduction({
        type: 'fantasme',
        dominantStyle: 'visuel',
        name: personalInfo.name
      })}
    `;

    // Construire le prompt utilisateur
    const userPrompt = `
      Crée une histoire érotique sensuelle pour ${personalInfo.name}, 
      qui s'identifie comme ${personalInfo.gender}.
      
      CATÉGORIES À INTÉGRER :
      ${selectedKinks.join(', ')}

      ${promptTemplates.authenticityRules}
      ${promptTemplates.getNarrationInstructions(personalInfo.name)}
      ${promptTemplates.eroticVocabulary}
      ${promptTemplates.hypnoticTechniques}
      
      DIRECTIVES SPÉCIFIQUES :
      1. Intègre toutes les catégories sélectionnées naturellement dans l'histoire
      2. Crée une histoire réaliste et authentique
      3. Utilise un langage direct et explicite
      4. Garde un équilibre entre les sons et le texte
      
      N'oublie pas d'utiliser (...) pour les pauses naturelles dans le texte.
      Utilise les sons phonétisés ("ahhh...", "mmmh...", etc.) et les variations de casse pour le crescendo.
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    // Ajouter des éléments aléatoires pour éviter la répétition
    const randomSeed = Math.floor(Math.random() * 10000);
    const randomTemperature = 0.7 + (Math.random() * 0.3); // Entre 0.7 et 1.0

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        messages,
        model: "grok-3-latest",
        stream: false,
        temperature: randomTemperature,
        seed: randomSeed
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de l\'histoire aléatoire');
    }

    const data = await response.json();
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
 * Génère une histoire personnalisée basée sur les choix de l'utilisateur
 * @param {Object} customChoices - Choix personnalisés
 * @param {Object} existingProfile - Profil existant (optionnel)
 * @returns {Promise<string>} Histoire générée
 */
export const generateCustomStory = async (customChoices, existingProfile = null) => {
  try {
    const { situation, personnage, lieu, readingTime = 2, eroticismLevel = 2 } = customChoices;
    
    // Obtenir les instructions d'érotisme
    const eroticismInstructions = promptTemplates.getEroticismInstructions(eroticismLevel);
    
    // Déterminer le style narratif et le vocabulaire si un profil existe
    let narrativeStyle = '';
    let vocabulaireStyle = '';
    
    if (existingProfile) {
      // Déterminer le style dominant pour le vocabulaire
      const styleKey = existingProfile.dominantStyle === 'VISUEL' ? 'visuel' : 
                       existingProfile.dominantStyle === 'AUDITIF' ? 'auditif' : 'kinesthesique';
      
      // Récupérer le style prédicat pour ce profil
      const styleData = predicats[styleKey];
      
      // Sélectionner les éléments de vocabulaire
      const verbes = styleData.verbes.slice(0, 8).join(', ');
      const adjectifs = styleData.adjectifs.slice(0, 8).join(', ');
      const expressions = styleData.expressions.slice(0, 5).join(', ');
      
      // Récupérer les phrases spécifiques au style
      const phrasesIntro = styleData.phrases_completes.introduction.slice(0, 2).join('\n');
      const phrasesAction = styleData.phrases_completes.action.slice(0, 4).join('\n');
      
      vocabulaireStyle = `
      VOCABULAIRE SUGGÉRÉ POUR TON STYLE ${existingProfile.dominantStyle} :
      
      VERBES : ${verbes}
      
      ADJECTIFS : ${adjectifs}
      
      EXPRESSIONS : ${expressions}
      `;

      narrativeStyle = `
      STYLE NARRATIF ${existingProfile.dominantStyle} :
      ${styleData.description}

      PHASES DE L'HISTOIRE :
      INTRODUCTION : ${styleData.phases.introduction}
      MONTÉE : ${styleData.phases.montee}
      CLIMAX : ${styleData.phases.climax}

      EXEMPLES DE PHRASES POUR L'INTRODUCTION :
      ${phrasesIntro}

      EXEMPLES DE PHRASES POUR L'ACTION :
      ${phrasesAction}

      TYPE D'EXCITATION ${existingProfile?.excitationType} :
      - Adapte l'intensité selon le profil
      - Utilise le style ${existingProfile?.tone}
      - Longueur ${existingProfile?.length}
      `;
    }

    // Construire le prompt système
    const systemPrompt = `
      ${promptTemplates.baseInstructions}

      ${eroticismInstructions}

      SCÉNARIO À DÉVELOPPER :
      - Situation : ${situation.label}
      - Personnage : ${personnage.label}
      - Lieu : ${lieu.label}
      - Temps de lecture souhaité : ${readingTime} minutes

      ${narrativeStyle}

      ${promptTemplates.narrativeStructure}
      ${promptTemplates.getIntroductionInstructions({
        type: 'relation',
        dominantStyle: existingProfile ? existingProfile.dominantStyle.toLowerCase() : 'visuel',
        name: existingProfile ? existingProfile.name : '',
        situation: situation.label,
        personnage: personnage.label,
        lieu: lieu.label
      })}
      ${promptTemplates.phoneticInstructions}
      ${promptTemplates.styleExamples}
      
      EXEMPLE D'INTRODUCTION SPÉCIFIQUE :
      ${introTemplates.generateCompleteIntroduction({
        type: 'relation',
        dominantStyle: existingProfile ? existingProfile.dominantStyle.toLowerCase() : 'visuel',
        name: existingProfile ? existingProfile.name : '',
        situation: situation.label,
        personnage: personnage.label,
        lieu: lieu.label
      })}
    `;

    // Exemple d'introduction adaptée si un profil existe
    let introExample = '';
    if (existingProfile) {
      introExample = `
      EXEMPLE D'INTRODUCTION ADAPTÉE :
      ${existingProfile.dominantStyle === 'VISUEL' ? `
      Dans ${lieu.label}, la lumière joue sur les formes. ${personnage.label} apparaît dans mon champ de vision, et mon regard ne peut plus se détacher...
      ` : existingProfile.dominantStyle === 'AUDITIF' ? `
      Dans ${lieu.label}, les sons résonnent doucement. La voix de ${personnage.label} me fait frissonner dès les premiers mots...
      ` : `
      Dans ${lieu.label}, l'air caresse ma peau. La présence de ${personnage.label} éveille déjà mes sens...
      `}
      `;
    }

    // Construire le prompt utilisateur
    const userPrompt = `
      Crée une histoire érotique ${existingProfile ? `adaptée au style ${existingProfile.dominantStyle.toLowerCase()}` : ''} basée sur :
      - Une rencontre dans ${lieu.label}
      - Avec ${personnage.label}
      - Impliquant ${situation.label}
      
      ${existingProfile ? `
      Utilise :
      - Un ton ${existingProfile.tone}
      - Une longueur ${existingProfile.length}
      - Un style d'excitation ${existingProfile.excitationType.toLowerCase()}
      
      ${vocabulaireStyle}
      ` : ''}

      ${promptTemplates.authenticityRules}
      ${promptTemplates.getNarrationInstructions(existingProfile ? existingProfile.name : 'l\'auditrice')}
      ${promptTemplates.eroticVocabulary}
      ${promptTemplates.hypnoticTechniques}
      ${promptTemplates.progressionInstructions}
      
      N'oublie pas d'utiliser (...) pour les pauses naturelles dans le texte.
      Utilise les sons phonétisés ("ahhh...", "mmmh...", etc.) et les variations de casse pour le crescendo.
    `;

    const messages = [
      { role: "system", content: systemPrompt + introExample },
      { role: "user", content: userPrompt }
    ];

    // Ajouter des éléments aléatoires pour éviter la répétition
    const randomSeed = Math.floor(Math.random() * 10000);
    const randomTemperature = 0.7 + (Math.random() * 0.3); // Entre 0.7 et 1.0

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        messages,
        model: "grok-3-latest",
        stream: false,
        temperature: randomTemperature,
        seed: randomSeed
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de l\'histoire personnalisée');
    }

    const data = await response.json();
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
 * Génère une histoire basée sur un fantasme libre
 * @param {string} fantasyText - Texte du fantasme
 * @param {Object} existingProfile - Profil existant (optionnel)
 * @param {number} readingTime - Temps de lecture souhaité
 * @param {number} eroticismLevel - Niveau d'érotisme
 * @returns {Promise<string>} Histoire générée
 */
export const generateFreeFantasyStory = async (fantasyText, existingProfile = null, readingTime = 2, eroticismLevel = 2) => {
  try {
    // Obtenir les instructions d'érotisme
    const eroticismInstructions = promptTemplates.getEroticismInstructions(eroticismLevel);
    
    // Déterminer le style narratif et le vocabulaire si un profil existe
    let narrativeStyle = '';
    let vocabulaireStyle = '';
    
    if (existingProfile) {
      // Déterminer le style dominant pour le vocabulaire
      const styleKey = existingProfile.dominantStyle === 'VISUEL' ? 'visuel' : 
                       existingProfile.dominantStyle === 'AUDITIF' ? 'auditif' : 'kinesthesique';
      
      // Sélectionner des éléments du vocabulaire pour ce style
      const stylePredicats = predicats[styleKey];
      const verbes = stylePredicats.verbes.slice(0, 8).join(', ');
      const adjectifs = stylePredicats.adjectifs.slice(0, 8).join(', ');
      const expressions = stylePredicats.expressions.slice(0, 5).join(', ');
      
      vocabulaireStyle = `
      VOCABULAIRE SUGGÉRÉ POUR TON STYLE ${existingProfile.dominantStyle} :
      
      VERBES : ${verbes}
      
      ADJECTIFS : ${adjectifs}
      
      EXPRESSIONS : ${expressions}
      `;
      
      narrativeStyle = `
      STYLE NARRATIF ${existingProfile.dominantStyle} :
      ${existingProfile.dominantStyle === 'VISUEL' ? `
      - Accentue les descriptions visuelles
      - Décris les regards, les postures, la lumière
      - Utilise un vocabulaire visuel riche
      - Mets l'accent sur ce qui se voit
      ` : existingProfile.dominantStyle === 'AUDITIF' ? `
      - Enrichis avec des sons, soupirs, murmures
      - Décris les voix, les gémissements
      - Utilise un vocabulaire sonore riche
      - Mets l'accent sur ce qui s'entend
      ` : `
      - Détaille les sensations physiques
      - Décris les touchers, les frissons
      - Utilise un vocabulaire tactile riche
      - Mets l'accent sur ce qui se ressent
      `}

      TYPE D'EXCITATION ${existingProfile?.excitationType} :
      - Adapte l'intensité selon le profil
      - Utilise le style ${existingProfile?.tone}
      - Longueur ${existingProfile?.length}
      `;
    }

    // Construire le prompt système
    const systemPrompt = `
      ${promptTemplates.baseInstructions}

      ANALYSE DU FANTASME :
      Analyse le texte fourni par l'utilisateur pour identifier :
      
      ${eroticismInstructions}
      
      TEMPS DE LECTURE SOUHAITÉ : ${readingTime} minutes
      - Les personnages impliqués
      - Le lieu et l'ambiance
      - Le type d'interaction souhaitée
      - Le niveau d'intensité désiré
      - Les éléments spécifiques qui excitent l'utilisateur

      ${narrativeStyle}

      ${promptTemplates.narrativeStructure}
      ${promptTemplates.getIntroductionInstructions({
        type: 'fantasme',
        dominantStyle: existingProfile ? existingProfile.dominantStyle.toLowerCase() : 'visuel',
        name: existingProfile ? existingProfile.name : ''
      })}
      ${promptTemplates.phoneticInstructions}
      ${promptTemplates.styleExamples}
      
      EXEMPLE D'INTRODUCTION SPÉCIFIQUE :
      ${introTemplates.generateCompleteIntroduction({
        type: 'fantasme',
        dominantStyle: existingProfile ? existingProfile.dominantStyle.toLowerCase() : 'visuel',
        name: existingProfile ? existingProfile.name : ''
      })}
    `;

    // Construire le prompt utilisateur
    const userPrompt = `
      Crée une histoire érotique basée sur le fantasme suivant :
      
      "${fantasyText}"
      
      ${existingProfile ? `
      Utilise :
      - Un ton ${existingProfile.tone}
      - Une longueur ${existingProfile.length}
      - Un style d'excitation ${existingProfile.excitationType.toLowerCase()}
      
      ${vocabulaireStyle}
      ` : ''}

      ${promptTemplates.authenticityRules}
      ${promptTemplates.getNarrationInstructions(existingProfile ? existingProfile.name : 'l\'auditrice')}
      ${promptTemplates.eroticVocabulary}
      ${promptTemplates.hypnoticTechniques}
      ${promptTemplates.progressionInstructions}
      
      N'oublie pas d'utiliser (...) pour les pauses naturelles dans le texte.
      Utilise les sons phonétisés ("ahhh...", "mmmh...", etc.) et les variations de casse pour le crescendo.
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    // Ajouter des éléments aléatoires pour éviter la répétition
    const randomSeed = Math.floor(Math.random() * 10000);
    const randomTemperature = 0.7 + (Math.random() * 0.3); // Entre 0.7 et 1.0

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        messages,
        model: "grok-3-latest",
        stream: false,
        temperature: randomTemperature,
        seed: randomSeed
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de l\'histoire personnalisée');
    }

    const data = await response.json();
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
    'short': 'histoire courte et intense (5-10 minutes de lecture)',
    'medium': 'histoire de longueur moyenne avec développement (10-15 minutes)',
    'long': 'histoire détaillée et immersive (15-20 minutes)'
  }
  return descriptions[length] || descriptions['medium']
}

export default {
  generateStory,
  generateRandomStory,
  generateCustomStory,
  generateFreeFantasyStory
}
