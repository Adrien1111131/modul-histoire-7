import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fondStart from '/fond start.png';

const questions = [
  {
    id: 1,
    text: "Quand tu penses à un moment intime, ce qui te revient en premier c'est :",
    options: [
      { value: 'A', label: 'Une image précise' },
      { value: 'B', label: 'Une sensation dans ton corps' },
      { value: 'C', label: 'Un son, une voix, un mot' }
    ]
  },
  {
    id: 2,
    text: "Dans un fantasme, ce qui t'excite le plus c'est :",
    options: [
      { value: 'A', label: 'Voir la scène dans ta tête' },
      { value: 'B', label: 'Sentir chaque détail dans ton corps' },
      { value: 'C', label: 'Entendre les mots ou les souffles' }
    ]
  },
  {
    id: 3,
    text: "Quand tu écoutes une histoire sensuelle, ce que tu préfères c'est :",
    options: [
      { value: 'A', label: 'Les descriptions visuelles (lieux, corps, gestes)' },
      { value: 'B', label: 'Les ressentis (chaleur, frissons, rythme)' },
      { value: 'C', label: 'Les mots prononcés, le ton de la voix' }
    ]
  },
  {
    id: 4,
    text: "Pendant un moment de plaisir, ce qui te fait fondre c'est :",
    options: [
      { value: 'A', label: 'Le regard et les gestes de l\'autre' },
      { value: 'B', label: 'Le contact, la texture, la température' },
      { value: 'C', label: 'Ce qu\'il ou elle te murmure' }
    ]
  },
  {
    id: 5,
    text: "Pour te mettre dans l'ambiance, tu préfères :",
    options: [
      { value: 'A', label: 'Un décor, une ambiance visuelle' },
      { value: 'B', label: 'Une caresse ou une sensation' },
      { value: 'C', label: 'Une phrase érotique ou une voix' }
    ]
  }
];

const SensoryQuestionnaire = ({ initialData = {}, onSubmit }) => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(initialData);

  const handleAnswerSelect = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(answers);
    
    // Récupérer l'ID du profil actif
    const activeProfileId = localStorage.getItem('active_profile_id');
    
    if (activeProfileId) {
      // Récupérer le profil actif
      const activeProfile = JSON.parse(localStorage.getItem('user_profiles')).find(
        profile => profile.id === activeProfileId
      );
      
      if (activeProfile) {
        // Mettre à jour le profil avec les réponses du questionnaire sensoriel
        const updatedProfile = {
          ...activeProfile,
          sensoryAnswers: answers,
          // Calculer le style sensoriel dominant
          dominantStyle: calculateDominantStyle(answers)
        };
        
        // Mettre à jour le profil dans le localStorage
        const profiles = JSON.parse(localStorage.getItem('user_profiles'));
        const updatedProfiles = profiles.map(profile => 
          profile.id === activeProfileId ? updatedProfile : profile
        );
        
        localStorage.setItem('user_profiles', JSON.stringify(updatedProfiles));
      }
    }
    
    navigate('/excitation-questionnaire');
  };
  
  // Fonction pour calculer le style sensoriel dominant
  const calculateDominantStyle = (answers) => {
    // Compter les occurrences de chaque type
    const counts = { A: 0, B: 0, C: 0 };
    
    Object.values(answers).forEach(answer => {
      counts[answer] = (counts[answer] || 0) + 1;
    });
    
    // Trouver le type dominant
    let dominantType = 'A';
    let maxCount = 0;
    
    Object.entries(counts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantType = type;
      }
    });
    
    // Mapper le type à une description
    const typeMap = {
      'A': 'VISUEL',
      'B': 'KINESTHÉSIQUE',
      'C': 'AUDITIF'
    };
    
    return typeMap[dominantType];
  };

  const handleSkip = () => {
    // Créer des réponses aléatoires pour chaque question
    const randomAnswers = {};
    questions.forEach(question => {
      const options = question.options;
      const randomIndex = Math.floor(Math.random() * options.length);
      randomAnswers[question.id] = options[randomIndex].value;
    });
    
    onSubmit(randomAnswers);
    
    // Récupérer l'ID du profil actif
    const activeProfileId = localStorage.getItem('active_profile_id');
    
    if (activeProfileId) {
      // Récupérer le profil actif
      const activeProfile = JSON.parse(localStorage.getItem('user_profiles')).find(
        profile => profile.id === activeProfileId
      );
      
      if (activeProfile) {
        // Mettre à jour le profil avec les réponses aléatoires du questionnaire sensoriel
        const updatedProfile = {
          ...activeProfile,
          sensoryAnswers: randomAnswers,
          // Calculer le style sensoriel dominant
          dominantStyle: calculateDominantStyle(randomAnswers),
          // Ajouter des réponses aléatoires pour le questionnaire d'excitation
          excitationAnswers: generateRandomExcitationAnswers(),
          // Calculer le type d'excitation dominant
          excitationType: 'ÉMOTIONNEL' // Valeur par défaut
        };
        
        // Mettre à jour le profil dans le localStorage
        const profiles = JSON.parse(localStorage.getItem('user_profiles'));
        const updatedProfiles = profiles.map(profile => 
          profile.id === activeProfileId ? updatedProfile : profile
        );
        
        localStorage.setItem('user_profiles', JSON.stringify(updatedProfiles));
      }
    }
    
    // Si l'utilisateur passe ce questionnaire, on le redirige directement vers la page d'accueil
    navigate('/home');
  };
  
  // Fonction pour générer des réponses aléatoires pour le questionnaire d'excitation
  const generateRandomExcitationAnswers = () => {
    const randomAnswers = {};
    // Simuler les questions du questionnaire d'excitation
    for (let i = 1; i <= 3; i++) {
      const options = ['A', 'B', 'C', 'D'];
      const randomIndex = Math.floor(Math.random() * options.length);
      randomAnswers[i] = options[randomIndex];
    }
    return randomAnswers;
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      {/* Section d'en-tête avec dégradé - identique à SmoothScrollPage */}
      <div className="w-full py-4 px-6 flex justify-end" style={{ background: 'linear-gradient(to right, #d5b394 0%, #c0a081 100%)' }}>
        <span className="font-serif text-xl">
          <span className="text-white">My</span>
          <span className="text-red-600">Desire</span>
          <span className="text-white">.now</span>
        </span>
      </div>

      {/* Conteneur principal avec défilement */}
      <div className="scroll-container w-full max-w-md mx-auto overflow-y-auto overflow-x-hidden h-[calc(100vh-60px)]">
        <div className="min-h-[calc(100vh-60px)] flex flex-col items-center px-8 py-10">
          <div className="text-white relative overflow-hidden">
            {/* Image de fond sans overlay */}
            <div className="absolute inset-0 z-0">
              <img src={fondStart} alt="Fond" className="w-full h-full object-cover" />
            </div>
            
            <div className="relative z-10 p-6">
              <h2 className="text-3xl font-serif text-center mb-4">Profil sensoriel</h2>
              
              <p className="text-amber-100 text-sm mb-8">
                Ce questionnaire nous permet d'adapter la narration de vos histoires à votre style sensoriel préféré 
                (visuel, auditif ou kinesthésique). Vos réponses amélioreront considérablement la qualité de votre expérience.
              </p>

              <form onSubmit={handleSubmit} className="space-y-8">
                {questions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    <p className="font-medium text-amber-100">{question.text}</p>
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-amber-200/20 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.value}
                            checked={answers[question.id] === option.value}
                            onChange={() => handleAnswerSelect(question.id, option.value)}
                            className="h-4 w-4 text-amber-500 border-amber-300/50 focus:ring-amber-500"
                          />
                          <span className="text-gray-200">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/personal-info')}
                    className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
                  >
                    Passer
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-400 transition-colors"
                  >
                    Continuer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensoryQuestionnaire;
