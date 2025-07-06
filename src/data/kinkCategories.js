// Organisation des catégories de fantasmes en grandes catégories et sous-catégories
const kinkCategories = [
  {
    id: 1,
    name: "Dynamiques de pouvoir",
    level: "soft",
    subcategories: [
      "Domination douce (Soft Dom)",
      "Domination dure (Hard Dom)",
      "Domination",
      "Subspace (État de soumission profonde)",
      "Échange de pouvoir (Power Exchange)",
      "Maître/Esclave (Master/Slave)",
      "Dynamique Papa/Maman (Daddy/Mommy Dynamics)",
      "Dressage de rebelle (Brat Taming)",
      "Soumission de service (Service Submission)",
      "Domination financière (Financial Domination)",
      "Alternance des rôles (Switching)"
    ]
  },
  {
    id: 2,
    name: "Pratiques physiques",
    level: "medium",
    subcategories: [
      "Fessée (Spanking)",
      "Flagellation (Flogging)",
      "Jeu d'impact (Impact Play)",
      "Tirage de cheveux (Hair Pulling)",
      "Morsure (Biting)",
      "Griffure (Scratching)",
      "Étranglement (Choking)",
      "Chatouilles (Tickling)",
      "Marquage (Marking)"
    ]
  },
  {
    id: 3,
    name: "Jeux de sensation",
    level: "soft",
    subcategories: [
      "Jeu avec de la cire (Waxplay)",
      "Jeu de température (Temperature Play)",
      "Jeu avec glace (Ice Play)",
      "Jeu avec feu (Fire Play)",
      "Électrojeu (Electroplay)",
      "Figging (Jeu avec gingembre)",
      "Jeu de sensations (Sensation Play)",
      "Privation sensorielle (Sensory Deprivation)",
      "Surcharge sensorielle (Overstimulation)"
    ]
  },
  {
    id: 4,
    name: "Contrôle et restriction",
    level: "medium",
    subcategories: [
      "Bondage (Attaches)",
      "Shibari (Art du bondage japonais)",
      "Entraves (Restraints)",
      "Bandeau sur les yeux (Blindfold)",
      "Bâillon (Gagging)",
      "Collier (Collar)",
      "Laisse (Leash)",
      "Chasteté (Chastity)",
      "Contrats",
      "Entraînement (Training)"
    ]
  },
  {
    id: 5,
    name: "Jeux sexuels spécifiques",
    level: "hard",
    subcategories: [
      "Facesitting (Assis sur le visage)",
      "Pegging (Pénétration avec gode-ceinture)",
      "Anulingus",
      "Jeu de souffle (Breathplay)",
      "Chevauchement de cuisse (Thigh Riding)",
      "Sexe habillé (Clothed Sex)",
      "Double pénétration (Fantaisie ou jouets)",
      "Jeu de prostate (Prostate Play)",
      "Jeu avec gode-ceinture (Strap-on Play)",
      "Traite (Milking)",
      "Gloryhole",
      "Golden Shower (Douche dorée)",
      "Bukkake",
      "Fisting",
      "Rimming"
    ]
  },
  {
    id: 6,
    name: "Contrôle de l'orgasme",
    level: "medium",
    subcategories: [
      "Edging (Contrôle de l'orgasme)",
      "Déni d'orgasme (Orgasm Denial)",
      "Taquinerie et déni (Tease and Denial)",
      "Orgasme ruiné (Ruined Orgasm)",
      "Orgasme forcé (Forced Orgasm)"
    ]
  },
  {
    id: 7,
    name: "Jeux psychologiques et émotionnels",
    level: "hard",
    subcategories: [
      "Taquinerie (Teasing)",
      "Humiliation",
      "Fétichisme des compliments (Praise Kink)",
      "Hypnose",
      "Jeu mental (Mind Play)",
      "Objectification (Transformation en objet)",
      "Rituels",
      "CNC (Non-consentement consenti)",
      "Dacryphilie (Plaisir des larmes)",
      "Somnophilie (Jeu avec le sommeil)"
    ]
  },
  {
    id: 8,
    name: "Jeux de rôle et scénarios",
    level: "medium",
    subcategories: [
      "Jeu de rôle (Roleplay)",
      "Professeur/Élève (Teacher/Student)",
      "Jeu d'âge (Age Play)",
      "Jeu d'uniforme (Uniform Play)",
      "Jeu médical (Medical Play)",
      "Dollification (Transformation en poupée)",
      "Mobilier humain (Human Furniture)",
      "Inceste (dans un cadre de jeu de rôle)"
    ]
  },
  {
    id: 9,
    name: "Jeux d'animaux et comportements",
    level: "medium",
    subcategories: [
      "Jeu d'animal de compagnie (Petplay)",
      "Jeu de chiot (Puppy Play)",
      "Jeu de chaton (Kitty Play)"
    ]
  },
  {
    id: 10,
    name: "Fétichismes et adoration",
    level: "medium",
    subcategories: [
      "Adoration des pieds (Foot Worship)",
      "Adoration du corps (Body Worship)",
      "Latex",
      "Cuir (Leather)",
      "Corsetterie (Corsetry)",
      "Bas (Stockings)",
      "Talons hauts (High Heels)",
      "Urophilie"
    ]
  },
  {
    id: 11,
    name: "Jeux extrêmes ou spécifiques",
    level: "hard",
    subcategories: [
      "Jeu avec piercing (Piercing Play)",
      "Sadisme",
      "Masochisme",
      "Breath Control (Contrôle extrême de la respiration)"
    ]
  },
  {
    id: 12,
    name: "Contextes et lieux",
    level: "soft",
    subcategories: [
      "Nature (Jeu en extérieur)",
      "Bureau (Jeu au bureau)",
      "Jeu en public (Public Play)",
      "Voyeurisme",
      "Exhibitionnisme"
    ]
  },
  {
    id: 13,
    name: "Dynamiques relationnelles",
    level: "hard",
    subcategories: [
      "Candaulisme (Cuckolding)",
      "Jeu en groupe (Group Play)",
      "Échangisme (Swinging)",
      "Dynamiques polyamoureuses (Poly Dynamics)"
    ]
  },
  {
    id: 14,
    name: "Transformation et identité",
    level: "hard",
    subcategories: [
      "Travestissement (Crossdressing)",
      "Jeu de genre (Gender Play)"
    ]
  },
  {
    id: 15,
    name: "Pratiques sexuelles courantes",
    level: "soft",
    subcategories: [
      "Fellation (Oral sur homme)",
      "Cunnilingus (Oral sur femme)",
      "Sodomie (Anal)",
      "Plan à trois (Threesome)",
      "Sexe en groupe (Group Sex)",
      "69 (Position)",
      "Masturbation mutuelle",
      "Branlette espagnole (Titty Fuck)",
      "Éjaculation faciale (Facial)",
      "Éjaculation corporelle (Body Cum)",
      "Avaler (Swallowing)",
      "Sexe intercrural (Entre les cuisses)",
      "Sexe interracial",
      "Sexe tantrique",
      "Sexe dans des lieux insolites"
    ]
  },
  {
    id: 16,
    name: "Positions et techniques",
    level: "soft",
    subcategories: [
      "Missionnaire",
      "Levrette (Doggy Style)",
      "Amazone (Cowgirl)",
      "Amazone inversée (Reverse Cowgirl)",
      "Cuillère (Spooning)",
      "Lotus",
      "Debout",
      "Ciseaux (Scissoring)",
      "Kamasutra (Positions variées)",
      "Edging (Contrôle de l'excitation)",
      "Squirting (Éjaculation féminine)"
    ]
  }
];

// Fonction pour obtenir une liste plate de toutes les sous-catégories
export const getAllSubcategories = () => {
  return kinkCategories.reduce((acc, category) => {
    return [...acc, ...category.subcategories];
  }, []);
};

export default kinkCategories;
