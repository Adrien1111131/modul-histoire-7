// Définition des niveaux de difficulté et leurs caractéristiques
export const kinkLevels = {
  soft: {
    id: 'soft',
    label: 'Soft',
    emoji: '🟢',
    badge: 'Débutant-friendly',
    description: 'Parfait pour débuter en douceur',
    gradient: 'from-rose-300/20 to-amber-200/20',
    border: 'border-rose-300/30',
    hoverBorder: 'hover:border-rose-300/50',
    icon: '🌸'
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    emoji: '🟡',
    badge: 'Intermédiaire',
    description: 'Pour plus de sensations',
    gradient: 'from-amber-500/20 to-orange-400/20',
    border: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-500/50',
    icon: '🌟'
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    emoji: '🔴',
    badge: 'Expérimenté',
    description: 'Pour les plus aventureux',
    gradient: 'from-red-800/20 to-rose-900/20',
    border: 'border-red-800/30',
    hoverBorder: 'hover:border-red-800/50',
    icon: '⚡'
  }
};

// Packs thématiques pré-configurés
export const kinkPacks = [
  {
    id: 'discovery',
    name: 'Pack Découverte',
    emoji: '🌟',
    description: 'Une sélection douce pour débuter',
    level: 'soft',
    categories: [1, 2, 3, 8, 12] // IDs des catégories recommandées
  },
  {
    id: 'romantic',
    name: 'Pack Romantique',
    emoji: '💝',
    description: 'Pour une expérience sensuelle et intime',
    level: 'soft',
    categories: [1, 3, 8, 15, 16]
  },
  {
    id: 'adventurer',
    name: 'Pack Aventurier',
    emoji: '🌋',
    description: 'Pour varier les plaisirs',
    level: 'medium',
    categories: [2, 4, 5, 6, 12]
  },
  {
    id: 'expert',
    name: 'Pack Expert',
    emoji: '⚡',
    description: 'Pour les plus expérimentés',
    level: 'hard',
    categories: [7, 11, 13, 5, 6]
  }
];

// Icônes pour chaque catégorie
export const categoryIcons = {
  1: '👑', // Dynamiques de pouvoir
  2: '🤲', // Pratiques physiques
  3: '✨', // Jeux de sensation
  4: '⛓️', // Contrôle et restriction
  5: '🎯', // Jeux sexuels spécifiques
  6: '🌊', // Contrôle de l'orgasme
  7: '🎭', // Jeux psychologiques
  8: '🎬', // Jeux de rôle
  9: '🐱', // Jeux d'animaux
  10: '👠', // Fétichismes
  11: '🔥', // Jeux extrêmes
  12: '🌳', // Contextes et lieux
  13: '👥', // Dynamiques relationnelles
  14: '🎭', // Transformation
  15: '💋', // Pratiques courantes
  16: '🎪'  // Positions
};

export default { kinkLevels, kinkPacks, categoryIcons };
