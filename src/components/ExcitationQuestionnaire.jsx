import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fondStart from '/fond start.png';

const questions = [
  {
    id: 1,
    text: "Ce qui te fait vraiment monter en tension, c'est :",
    options: [
      { value: 'A', label: 'Le lien affectif, sentir qu\'il/elle te désire profondément' },
      { value: 'B', label: 'L\'histoire, le scénario, le contexte interdit ou spécial' },
      { value: 'C', label: 'Le fait de lâcher prise, qu\'on prenne le contrôle avec douceur ou assurance' },
      { value: 'D', label: 'Les odeurs, les goûts, l\'ambiance charnelle qui flotte' }
    ]
  },
  {
    id: 2,
    text: "Quand tu fantasmes, tu te projettes surtout :",
    options: [
      { value: 'A', label: 'Dans une histoire romantique ou passionnée' },
      { value: 'B', label: 'Dans un jeu de rôle ou une situation intrigante' },
      { value: 'C', label: 'Dans une expérience où tu te laisses guider' },
      { value: 'D', label: 'Dans un monde très sensoriel où les odeurs et les goûts comptent' }
    ]
  },
  {
    id: 3,
    text: "Tu es touchée par :",
    options: [
      { value: 'A', label: 'Les déclarations, la tendresse ou la connexion' },
      { value: 'B', label: 'L\'originalité, la surprise, la créativité' },
      { value: 'C', label: 'Les ordres doux, les gestes assurés' },
      { value: 'D', label: 'Les parfums, la salive, la peau' }
    ]
  }
];

const ExcitationQuestionnaire = ({ initialData = {}, onSubmit }) => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(initialData);

  const handleAnswerSelect = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Fonction pour calculer le type d'excitation dominant
  const calculateExcitationType = (answers) => {
    // Compter les occurrences de chaque type
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    
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
      'A': 'ÉMOTIONNEL',
      'B': 'NARRATIF',
      'C': 'DOMINANT/SOUMIS',
      'D': 'SENSORIEL'
    };
    
    return typeMap[dominantType];
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
        // Mettre à jour le profil avec les réponses du questionnaire d'excitation
        const updatedProfile = {
          ...activeProfile,
          excitationAnswers: answers,
          // Calculer le type d'excitation dominant
          excitationType: calculateExcitationType(answers)
        };
        
        // Mettre à jour le profil dans le localStorage
        const profiles = JSON.parse(localStorage.getItem('user_profiles'));
        const updatedProfiles = profiles.map(profile => 
          profile.id === activeProfileId ? updatedProfile : profile
        );
        
        localStorage.setItem('user_profiles', JSON.stringify(updatedProfiles));
      }
    }
    
    // Rediriger vers la page d'accueil
    navigate('/home');
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
        // Mettre à jour le profil avec les réponses aléatoires du questionnaire d'excitation
        const updatedProfile = {
          ...activeProfile,
          excitationAnswers: randomAnswers,
          // Calculer le type d'excitation dominant
          excitationType: calculateExcitationType(randomAnswers)
        };
        
        // Mettre à jour le profil dans le localStorage
        const profiles = JSON.parse(localStorage.getItem('user_profiles'));
        const updatedProfiles = profiles.map(profile => 
          profile.id === activeProfileId ? updatedProfile : profile
        );
        
        localStorage.setItem('user_profiles', JSON.stringify(updatedProfiles));
      }
    }
    
    navigate('/home');
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
              <h2 className="text-3xl font-serif text-center mb-4">Préférences d'excitation</h2>
              
              <p className="text-amber-100 text-sm mb-8">
                Ce questionnaire nous permet d'identifier vos déclencheurs d'excitation préférés pour 
                personnaliser le contenu émotionnel et les thèmes de vos histoires. Vos réponses 
                rendront vos histoires plus stimulantes et adaptées à vos goûts.
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
                    onClick={() => navigate('/sensory-questionnaire')}
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
                    Valider
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

export default ExcitationQuestionnaire;
