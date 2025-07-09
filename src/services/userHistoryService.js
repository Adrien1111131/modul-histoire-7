// Service pour gérer l'historique complet des utilisateurs
import profileService from './profileService';

const USER_HISTORY_STORAGE_KEY = 'user_complete_history';

/**
 * Structure de l'historique utilisateur :
 * {
 *   userId: string,
 *   userName: string,
 *   profile: { ... },
 *   questionnaires: {
 *     sensory: { questions: [...], answers: {...} },
 *     excitation: { questions: [...], answers: {...} }
 *   },
 *   selectedFantasies: [
 *     { category: string, subcategory: string, timestamp: string }
 *   ],
 *   freeTexts: [
 *     { type: string, content: string, timestamp: string }
 *   ],
 *   generatedStories: [
 *     {
 *       id: string,
 *       type: 'random' | 'custom' | 'free',
 *       content: string,
 *       parameters: {...},
 *       timestamp: string
 *     }
 *   ],
 *   lastUpdated: string
 * }
 */

/**
 * Récupère l'historique complet de tous les utilisateurs
 * @returns {Array} Liste des historiques utilisateur
 */
export const getAllUserHistories = () => {
  try {
    const historiesJson = localStorage.getItem(USER_HISTORY_STORAGE_KEY);
    return historiesJson ? JSON.parse(historiesJson) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des historiques:', error);
    return [];
  }
};

/**
 * Récupère l'historique d'un utilisateur spécifique
 * @param {string} userId - ID de l'utilisateur
 * @returns {Object|null} Historique de l'utilisateur ou null
 */
export const getUserHistory = (userId) => {
  try {
    const histories = getAllUserHistories();
    return histories.find(history => history.userId === userId) || null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique utilisateur:', error);
    return null;
  }
};

/**
 * Crée ou met à jour l'historique d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} updates - Mises à jour à appliquer
 * @returns {Object} Historique mis à jour
 */
export const updateUserHistory = (userId, updates) => {
  try {
    const histories = getAllUserHistories();
    const existingIndex = histories.findIndex(history => history.userId === userId);
    
    // Récupérer les informations du profil actuel
    const profile = profileService.getProfileById(userId);
    const userName = profile?.name || profile?.personalInfo?.name || 'Utilisateur';
    
    let userHistory;
    
    if (existingIndex !== -1) {
      // Mettre à jour l'historique existant
      userHistory = {
        ...histories[existingIndex],
        ...updates,
        userName,
        lastUpdated: new Date().toISOString()
      };
      histories[existingIndex] = userHistory;
    } else {
      // Créer un nouvel historique
      userHistory = {
        userId,
        userName,
        profile: profile || {},
        questionnaires: {
          sensory: { questions: [], answers: {} },
          excitation: { questions: [], answers: {} }
        },
        selectedFantasies: [],
        freeTexts: [],
        generatedStories: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        ...updates
      };
      histories.push(userHistory);
    }
    
    // Sauvegarder
    localStorage.setItem(USER_HISTORY_STORAGE_KEY, JSON.stringify(histories));
    
    return userHistory;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'historique:', error);
    return null;
  }
};

/**
 * Enregistre une histoire générée
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} storyData - Données de l'histoire
 * @returns {boolean} Succès de l'opération
 */
export const logGeneratedStory = (userId, storyData) => {
  try {
    const userHistory = getUserHistory(userId) || {};
    const existingStories = userHistory.generatedStories || [];
    
    const newStory = {
      id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: storyData.type || 'unknown',
      content: storyData.content || '',
      parameters: {
        readingTime: storyData.readingTime,
        eroticismLevel: storyData.eroticismLevel,
        selectedKinks: storyData.selectedKinks,
        customPrompt: storyData.customPrompt,
        freeText: storyData.freeText,
        dominantStyle: storyData.dominantStyle,
        excitationType: storyData.excitationType
      },
      timestamp: new Date().toISOString()
    };
    
    updateUserHistory(userId, {
      generatedStories: [...existingStories, newStory]
    });
    
    console.log('📚 Histoire enregistrée pour l\'utilisateur:', userId);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'histoire:', error);
    return false;
  }
};

/**
 * Enregistre les réponses à un questionnaire
 * @param {string} userId - ID de l'utilisateur
 * @param {string} questionnaireType - Type de questionnaire ('sensory' ou 'excitation')
 * @param {Array} questions - Liste des questions
 * @param {Object} answers - Réponses de l'utilisateur
 * @returns {boolean} Succès de l'opération
 */
export const logQuestionnaireAnswers = (userId, questionnaireType, questions, answers) => {
  try {
    const userHistory = getUserHistory(userId) || {};
    const existingQuestionnaires = userHistory.questionnaires || {
      sensory: { questions: [], answers: {} },
      excitation: { questions: [], answers: {} }
    };
    
    const updatedQuestionnaires = {
      ...existingQuestionnaires,
      [questionnaireType]: {
        questions: questions || [],
        answers: answers || {},
        completedAt: new Date().toISOString()
      }
    };
    
    updateUserHistory(userId, {
      questionnaires: updatedQuestionnaires
    });
    
    console.log(`📋 Questionnaire ${questionnaireType} enregistré pour l'utilisateur:`, userId);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du questionnaire:', error);
    return false;
  }
};

/**
 * Enregistre les fantasmes sélectionnés
 * @param {string} userId - ID de l'utilisateur
 * @param {Array} selectedKinks - Liste des fantasmes sélectionnés
 * @param {string} context - Contexte de sélection (ex: 'random_story', 'custom_story')
 * @returns {boolean} Succès de l'opération
 */
export const logSelectedFantasies = (userId, selectedKinks, context = 'unknown') => {
  try {
    const userHistory = getUserHistory(userId) || {};
    const existingFantasies = userHistory.selectedFantasies || [];
    
    const newFantasies = selectedKinks.map(kink => ({
      category: kink.category || 'Non spécifiée',
      subcategory: kink.subcategory || kink.name || kink,
      context,
      timestamp: new Date().toISOString()
    }));
    
    updateUserHistory(userId, {
      selectedFantasies: [...existingFantasies, ...newFantasies]
    });
    
    console.log('💭 Fantasmes enregistrés pour l\'utilisateur:', userId);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des fantasmes:', error);
    return false;
  }
};

/**
 * Enregistre un texte libre saisi par l'utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} type - Type de texte ('free_fantasy', 'custom_prompt', etc.)
 * @param {string} content - Contenu du texte
 * @param {Object} metadata - Métadonnées supplémentaires
 * @returns {boolean} Succès de l'opération
 */
export const logFreeText = (userId, type, content, metadata = {}) => {
  try {
    const userHistory = getUserHistory(userId) || {};
    const existingTexts = userHistory.freeTexts || [];
    
    const newText = {
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      metadata,
      timestamp: new Date().toISOString()
    };
    
    updateUserHistory(userId, {
      freeTexts: [...existingTexts, newText]
    });
    
    console.log('✍️ Texte libre enregistré pour l\'utilisateur:', userId);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du texte libre:', error);
    return false;
  }
};

/**
 * Met à jour le profil dans l'historique
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} profileData - Données du profil
 * @returns {boolean} Succès de l'opération
 */
export const updateProfileInHistory = (userId, profileData) => {
  try {
    updateUserHistory(userId, {
      profile: profileData
    });
    
    console.log('👤 Profil mis à jour dans l\'historique pour l\'utilisateur:', userId);
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil dans l\'historique:', error);
    return false;
  }
};

/**
 * Récupère les statistiques d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Object} Statistiques de l'utilisateur
 */
export const getUserStats = (userId) => {
  try {
    const history = getUserHistory(userId);
    
    if (!history) {
      return {
        totalStories: 0,
        totalFantasies: 0,
        totalFreeTexts: 0,
        questionnairesCompleted: 0,
        lastActivity: null
      };
    }
    
    return {
      totalStories: history.generatedStories?.length || 0,
      totalFantasies: history.selectedFantasies?.length || 0,
      totalFreeTexts: history.freeTexts?.length || 0,
      questionnairesCompleted: Object.keys(history.questionnaires || {}).filter(
        key => history.questionnaires[key].completedAt
      ).length,
      lastActivity: history.lastUpdated,
      storiesByType: (history.generatedStories || []).reduce((acc, story) => {
        acc[story.type] = (acc[story.type] || 0) + 1;
        return acc;
      }, {}),
      mostUsedFantasies: (history.selectedFantasies || []).reduce((acc, fantasy) => {
        const key = fantasy.subcategory;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return {};
  }
};

/**
 * Exporte l'historique d'un utilisateur au format JSON
 * @param {string} userId - ID de l'utilisateur
 * @returns {string} Données JSON
 */
export const exportUserHistory = (userId) => {
  try {
    const history = getUserHistory(userId);
    return JSON.stringify(history, null, 2);
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    return '{}';
  }
};

/**
 * Supprime l'historique d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {boolean} Succès de l'opération
 */
export const deleteUserHistory = (userId) => {
  try {
    const histories = getAllUserHistories();
    const filteredHistories = histories.filter(history => history.userId !== userId);
    
    localStorage.setItem(USER_HISTORY_STORAGE_KEY, JSON.stringify(filteredHistories));
    
    console.log('🗑️ Historique supprimé pour l\'utilisateur:', userId);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'historique:', error);
    return false;
  }
};

/**
 * Récupère l'utilisateur actuel
 * @returns {string|null} ID de l'utilisateur actuel
 */
export const getCurrentUserId = () => {
  try {
    return profileService.getActiveProfile();
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur actuel:', error);
    return null;
  }
};

export default {
  getAllUserHistories,
  getUserHistory,
  updateUserHistory,
  logGeneratedStory,
  logQuestionnaireAnswers,
  logSelectedFantasies,
  logFreeText,
  updateProfileInHistory,
  getUserStats,
  exportUserHistory,
  deleteUserHistory,
  getCurrentUserId
};
