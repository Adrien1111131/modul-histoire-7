// Service pour capturer et analyser les interactions utilisateur

const ANALYTICS_STORAGE_KEY = 'user_analytics_logs';
const SESSION_STORAGE_KEY = 'current_session_id';

/**
 * Génère un ID de session unique
 * @returns {string} ID de session
 */
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Récupère ou crée un ID de session
 * @returns {string} ID de session actuel
 */
const getSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
};

/**
 * Récupère l'utilisateur actuel
 * @returns {Object} Informations utilisateur
 */
const getCurrentUser = () => {
  try {
    const activeProfileId = localStorage.getItem('active_profile_id');
    if (activeProfileId) {
      const profiles = JSON.parse(localStorage.getItem('user_profiles') || '[]');
      const profile = profiles.find(p => p.id === activeProfileId);
      if (profile) {
        return {
          userId: profile.id,
          userName: profile.personalInfo?.name || profile.name || 'Utilisateur',
          userEmail: profile.personalInfo?.email || 'non-spécifié',
          userGender: profile.personalInfo?.gender || profile.gender || 'non-spécifié',
          userAgeRange: profile.personalInfo?.ageRange || 'non-spécifié',
          userOrientation: profile.personalInfo?.orientation || 'non-spécifié',
          dominantStyle: profile.dominantStyle || 'non-spécifié',
          excitationType: profile.excitationType || 'non-spécifié',
          sensoryAnswers: profile.sensoryAnswers || {},
          excitationAnswers: profile.excitationAnswers || {}
        };
      }
    }
    
    // Utilisateur anonyme
    return {
      userId: 'anonymous',
      userName: 'Utilisateur Anonyme',
      userEmail: 'non-spécifié',
      userGender: 'non-spécifié',
      userAgeRange: 'non-spécifié',
      userOrientation: 'non-spécifié',
      dominantStyle: 'non-spécifié',
      excitationType: 'non-spécifié',
      sensoryAnswers: {},
      excitationAnswers: {}
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return {
      userId: 'anonymous',
      userName: 'Utilisateur Anonyme',
      userEmail: 'non-spécifié',
      userGender: 'non-spécifié',
      userAgeRange: 'non-spécifié',
      userOrientation: 'non-spécifié',
      dominantStyle: 'non-spécifié',
      excitationType: 'non-spécifié',
      sensoryAnswers: {},
      excitationAnswers: {}
    };
  }
};

/**
 * Enregistre un événement d'analytics
 * @param {string} action - Type d'action effectuée
 * @param {string} component - Composant source
 * @param {Object} data - Données associées à l'action
 * @param {Object} metadata - Métadonnées supplémentaires
 */
export const logUserAction = (action, component, data = {}, metadata = {}) => {
  try {
    const user = getCurrentUser();
    const sessionId = getSessionId();
    
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      sessionId,
      ...user,
      action,
      component,
      data: JSON.parse(JSON.stringify(data)), // Deep clone pour éviter les références
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.pathname,
        ...metadata
      }
    };

    // Récupérer les logs existants
    const existingLogs = JSON.parse(localStorage.getItem(ANALYTICS_STORAGE_KEY) || '[]');
    
    // Ajouter le nouveau log
    existingLogs.push(logEntry);
    
    // Limiter à 10000 entrées pour éviter de surcharger le localStorage
    if (existingLogs.length > 10000) {
      existingLogs.splice(0, existingLogs.length - 10000);
    }
    
    // Sauvegarder
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(existingLogs));
    
    console.log('📊 Analytics:', action, data);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement analytics:', error);
  }
};

/**
 * Récupère tous les logs d'analytics
 * @returns {Array} Liste des logs
 */
export const getAllLogs = () => {
  try {
    return JSON.parse(localStorage.getItem(ANALYTICS_STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error);
    return [];
  }
};

/**
 * Récupère les logs pour un utilisateur spécifique
 * @param {string} userId - ID de l'utilisateur
 * @returns {Array} Logs de l'utilisateur
 */
export const getUserLogs = (userId) => {
  const allLogs = getAllLogs();
  return allLogs.filter(log => log.userId === userId);
};

/**
 * Récupère les statistiques globales
 * @returns {Object} Statistiques
 */
export const getGlobalStats = () => {
  const allLogs = getAllLogs();
  
  // Compter les utilisateurs uniques
  const uniqueUsers = [...new Set(allLogs.map(log => log.userId))];
  
  // Compter les sessions uniques
  const uniqueSessions = [...new Set(allLogs.map(log => log.sessionId))];
  
  // Compter les actions par type
  const actionCounts = allLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});
  
  // Compter les composants les plus utilisés
  const componentCounts = allLogs.reduce((acc, log) => {
    acc[log.component] = (acc[log.component] || 0) + 1;
    return acc;
  }, {});
  
  return {
    totalLogs: allLogs.length,
    uniqueUsers: uniqueUsers.length,
    uniqueSessions: uniqueSessions.length,
    actionCounts,
    componentCounts,
    dateRange: {
      first: allLogs.length > 0 ? allLogs[0].timestamp : null,
      last: allLogs.length > 0 ? allLogs[allLogs.length - 1].timestamp : null
    }
  };
};

/**
 * Récupère la liste des utilisateurs avec leurs statistiques
 * @returns {Array} Liste des utilisateurs avec stats
 */
export const getUsersList = () => {
  const allLogs = getAllLogs();
  const userStats = {};
  
  allLogs.forEach(log => {
    if (!userStats[log.userId]) {
      userStats[log.userId] = {
        userId: log.userId,
        userName: log.userName,
        userGender: log.userGender,
        totalActions: 0,
        lastActivity: log.timestamp,
        firstActivity: log.timestamp,
        sessions: new Set(),
        actions: {}
      };
    }
    
    const user = userStats[log.userId];
    user.totalActions++;
    user.sessions.add(log.sessionId);
    user.actions[log.action] = (user.actions[log.action] || 0) + 1;
    
    // Mettre à jour les dates
    if (new Date(log.timestamp) > new Date(user.lastActivity)) {
      user.lastActivity = log.timestamp;
    }
    if (new Date(log.timestamp) < new Date(user.firstActivity)) {
      user.firstActivity = log.timestamp;
    }
  });
  
  // Convertir les Sets en nombres et trier par dernière activité
  return Object.values(userStats)
    .map(user => ({
      ...user,
      totalSessions: user.sessions.size,
      sessions: undefined // Supprimer le Set pour la sérialisation
    }))
    .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
};

/**
 * Exporte les logs au format CSV
 * @returns {string} Données CSV
 */
export const exportLogsToCSV = () => {
  const logs = getAllLogs();
  
  if (logs.length === 0) {
    return 'Aucune donnée à exporter';
  }
  
  // En-têtes CSV
  const headers = [
    'Timestamp',
    'Session ID',
    'User ID',
    'User Name',
    'User Gender',
    'Action',
    'Component',
    'Data',
    'URL'
  ];
  
  // Convertir les logs en lignes CSV
  const csvRows = logs.map(log => [
    log.timestamp,
    log.sessionId,
    log.userId,
    log.userName,
    log.userGender,
    log.action,
    log.component,
    JSON.stringify(log.data),
    log.metadata?.url || ''
  ]);
  
  // Combiner en-têtes et données
  const csvContent = [headers, ...csvRows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  return csvContent;
};

/**
 * Efface tous les logs (pour les tests)
 * @returns {boolean} Succès de l'opération
 */
export const clearAllLogs = () => {
  try {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'effacement des logs:', error);
    return false;
  }
};

// Actions prédéfinies pour la cohérence
export const ANALYTICS_ACTIONS = {
  // Profil
  PROFILE_CREATED: 'profile_created',
  PROFILE_UPDATED: 'profile_updated',
  PROFILE_SELECTED: 'profile_selected',
  PROFILE_DELETED: 'profile_deleted',
  
  // Questionnaires
  SENSORY_QUESTION_ANSWERED: 'sensory_question_answered',
  SENSORY_QUESTIONNAIRE_COMPLETED: 'sensory_questionnaire_completed',
  SENSORY_QUESTIONNAIRE_SKIPPED: 'sensory_questionnaire_skipped',
  EXCITATION_QUESTION_ANSWERED: 'excitation_question_answered',
  EXCITATION_QUESTIONNAIRE_COMPLETED: 'excitation_questionnaire_completed',
  EXCITATION_QUESTIONNAIRE_SKIPPED: 'excitation_questionnaire_skipped',
  
  // Mode Guidé
  GUIDED_SITUATION_SELECTED: 'guided_situation_selected',
  GUIDED_CHARACTER_SELECTED: 'guided_character_selected',
  GUIDED_LOCATION_SELECTED: 'guided_location_selected',
  GUIDED_STORY_CONFIGURED: 'guided_story_configured',
  
  // Mode Mystère
  MYSTERY_SETTINGS_CONFIGURED: 'mystery_settings_configured',
  MYSTERY_STORY_GENERATED: 'mystery_story_generated',
  
  // Mode Fantasmes
  KINK_SELECTED: 'kink_selected',
  KINK_DESELECTED: 'kink_deselected',
  KINKS_STORY_CONFIGURED: 'kinks_story_configured',
  
  // Mode Libre
  FREE_FANTASY_STARTED: 'free_fantasy_started',
  FREE_FANTASY_WRITTEN: 'free_fantasy_written',
  FREE_FANTASY_SUBMITTED: 'free_fantasy_submitted',
  
  // Paramètres
  READING_TIME_CHANGED: 'reading_time_changed',
  EROTICISM_LEVEL_CHANGED: 'eroticism_level_changed',
  
  // Génération
  STORY_GENERATION_STARTED: 'story_generation_started',
  STORY_GENERATED: 'story_generated',
  STORY_GENERATION_FAILED: 'story_generation_failed',
  STORY_VIEWED: 'story_viewed',
  STORY_SHARED: 'story_shared',
  
  // Navigation
  PAGE_VISITED: 'page_visited',
  BUTTON_CLICKED: 'button_clicked',
  MODAL_OPENED: 'modal_opened',
  MODAL_CLOSED: 'modal_closed'
};

export default {
  logUserAction,
  getAllLogs,
  getUserLogs,
  getGlobalStats,
  getUsersList,
  exportLogsToCSV,
  clearAllLogs,
  ANALYTICS_ACTIONS
};
