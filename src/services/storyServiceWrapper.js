import grokApi from './grokApi';

/**
 * Wrapper sécurisé pour la fonction generateCustomStory
 * Ajoute des vérifications pour éviter les erreurs "Cannot read properties of undefined"
 */
export const generateCustomStory = async (customChoices, existingProfile = null) => {
  try {
    // Vérifier que customChoices est un objet valide
    if (!customChoices || typeof customChoices !== 'object') {
      console.error('Wrapper - Données de choix personnalisés invalides:', customChoices);
      throw new Error('Données de choix personnalisés invalides');
    }
    
    // Extraire les propriétés avec des valeurs par défaut
    const { 
      situation = { label: 'Situation par défaut' }, 
      personnage = { label: 'Personnage par défaut' }, 
      lieu = { label: 'Lieu par défaut' }, 
      readingTime = 5,
      eroticismLevel = 2 
    } = customChoices;
    
    // Créer un objet customChoices sécurisé
    const safeCustomChoices = {
      situation,
      personnage,
      lieu,
      readingTime,
      eroticismLevel
    };
    
    // Créer un profil sécurisé si un profil existe
    let safeProfile = null;
    if (existingProfile) {
      safeProfile = {
        ...existingProfile,
        // Valeurs par défaut pour les propriétés qui pourraient être undefined
        dominantStyle: existingProfile.dominantStyle || 'VISUEL',
        excitationType: existingProfile.excitationType || 'ÉMOTIONNEL',
        tone: existingProfile.tone || 'doux',
        length: existingProfile.length || 'medium',
        name: existingProfile.personalInfo?.name || 'chérie'
      };
    }
    
    // Appeler la fonction d'origine avec les données sécurisées
    return await grokApi.generateCustomStory(safeCustomChoices, safeProfile);
  } catch (error) {
    console.error('Erreur dans le wrapper generateCustomStory:', error);
    // Retourner un message d'erreur formaté en cas d'échec
    return `Une erreur est survenue lors de la génération de l'histoire. Veuillez réessayer plus tard.\n\nDétails techniques: ${error.message}`;
  }
};

/**
 * Exporte toutes les autres fonctions de grokApi sans modification
 */
export const { 
  generateStory, 
  generateRandomStory, 
  generateFreeFantasyStory 
} = grokApi;

// Exporter un objet par défaut avec toutes les fonctions
export default {
  generateStory,
  generateRandomStory,
  generateCustomStory,
  generateFreeFantasyStory
};
