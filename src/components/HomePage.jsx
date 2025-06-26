import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from './ProfileCard';
import profileService from '../services/profileService';
import MysterySettingsModal from './MysterySettingsModal';
import { logUserAction, ANALYTICS_ACTIONS } from '../services/analyticsService';
import fondStart from '/fond start.png';
import myDesireLogo from '/logo1.png';
import inattenduImg from '/linatendu.png';
import guideeImg from '/guidee.png';
import fantasmeImg from '/fantasme.png';
import libreImg from '/libre.png';

const HomePage = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [showEroticismSlider, setShowEroticismSlider] = useState(false);
  const [tempRandomStoryData, setTempRandomStoryData] = useState(null);

  useEffect(() => {
    // Charger les profils au démarrage
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    const savedProfiles = profileService.getProfiles();
    setProfiles(savedProfiles);
    setHasProfile(savedProfiles.length > 0);
    
    // Récupérer le profil actif
    const activeId = profileService.getActiveProfile();
    setActiveProfileId(activeId);
  };

  const handleSelectProfile = (profileId) => {
    profileService.setActiveProfile(profileId);
    setActiveProfileId(profileId);
  };

  const handleEditProfile = (profileId) => {
    // Rediriger vers le formulaire de profil avec l'ID du profil à modifier
    navigate(`/personal-info?edit=${profileId}`);
  };

  const handleDeleteProfile = (profileId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce profil ?')) {
      profileService.deleteProfile(profileId);
      loadProfiles(); // Recharger la liste après suppression
    }
  };

  const handleAddProfile = () => {
    navigate('/personal-info');
    setShowProfileModal(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md mx-auto border border-[#a69485] rounded-lg overflow-hidden">
        {/* En-tête */}
        <div className="bg-[#c4b5a6] p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-12 w-12 mr-3">
              <img src={myDesireLogo} alt="MyDesire Logo" className="h-full w-full object-contain" />
            </div>
            <div className="text-xl font-medium text-gray-700">
              My<span className="text-red-800">Desire</span>.now
            </div>
          </div>
          <button 
            onClick={() => setShowProfileModal(!showProfileModal)}
            className="relative w-10 h-10 rounded-full bg-[#b3a394] flex items-center justify-center text-gray-700 hover:bg-[#a69485] transition-colors shadow-md"
          >
            <span className="text-sm">Profil</span>
          </button>
        </div>

        {/* Modal de gestion des profils */}
        {showProfileModal && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
              <div className="bg-amber-500 text-white px-4 py-3 flex justify-between items-center">
                <h3 className="text-lg font-medium">Gestion des profils</h3>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="text-white hover:text-amber-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4">
                {profiles.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {profiles.map(profile => (
                      <ProfileCard 
                        key={profile.id}
                        profile={profile}
                        isActive={profile.id === activeProfileId}
                        onSelect={() => handleSelectProfile(profile.id)}
                        onEdit={() => handleEditProfile(profile.id)}
                        onDelete={() => handleDeleteProfile(profile.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Aucun profil enregistré. Créez votre premier profil pour personnaliser vos histoires.
                  </p>
                )}
                
                <div className="flex justify-center mt-4">
                  <button
                    onClick={handleAddProfile}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Ajouter un profil
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Contenu principal */}
        <div className="text-white">
          <div className="p-6">
            <h2 className="title-main text-center mb-6">Créez votre histoire...</h2>
            
            <p className="description-card text-amber-200/80 text-sm mb-8 text-center">
              Choisissez votre expérience : laissez-vous surprendre par le Mystère, optez pour un 
              scénario Guidé, explorez vos Fantasmes ou écrivez librement avec Libre.
            </p>

            {/* Grille des options - Disposition 2x2 comme dans l'image */}
            <div className="grid grid-cols-2 gap-6">
              {/* L'Inattendu */}
              <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <img src={inattenduImg} alt="L'Inattendu" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative p-4 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="mr-2 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M4 4v16h16V4H4zm2 2h12v12H6V6zm4 4h4v4h-4v-4z" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <h3 className="title-card text-lg text-white truncate">Mystère</h3>
                    </div>
                    <p className="description-card text-sm text-white/90 mb-4">
                      Une histoire sensuelle totalement mystérieuse.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        // Récupérer le profil actif s'il existe
                        const activeProfile = profileService.getActiveProfileData();
                        
                        // Créer un profil par défaut si aucun profil actif n'est trouvé
                        const defaultProfile = {
                          name: "Utilisateur",
                          gender: "femme",
                          orientation: "hétérosexuelle",
                          dominantStyle: "VISUEL",
                          excitationType: "ÉMOTIONNEL",
                          tone: "doux",
                          length: "medium"
                        };
                        
                        // Utiliser le profil actif ou le profil par défaut
                        const profileToUse = activeProfile || defaultProfile;

                        // Générer des kinks aléatoires (entre 2 et 4)
                        const allKinks = [
                          'Romance', 'Passion', 'Sensualité', 'Désir', 'Séduction',
                          'Fantasme', 'Intimité', 'Plaisir', 'Érotisme', 'Tension'
                        ];
                        const numKinks = Math.floor(Math.random() * 3) + 2; // 2 à 4 kinks
                        const randomKinks = [];
                        
                        // Sélectionner des kinks aléatoires sans répétition
                        while (randomKinks.length < numKinks && allKinks.length > 0) {
                          const randomIndex = Math.floor(Math.random() * allKinks.length);
                          randomKinks.push(allKinks[randomIndex]);
                          allKinks.splice(randomIndex, 1);
                        }

                        // Créer les données de base pour l'histoire aléatoire
                        const storyData = {
                          personalInfo: {
                            name: profileToUse.name,
                            gender: profileToUse.gender,
                            orientation: profileToUse.orientation || 'hétérosexuelle'
                          },
                          selectedKinks: randomKinks,
                          dominantStyle: profileToUse.dominantStyle || "VISUEL",
                          excitationType: profileToUse.excitationType || "ÉMOTIONNEL",
                          tone: profileToUse.tone || 'doux',
                          length: profileToUse.length || 'medium'
                        };

                        // Stocker temporairement les données
                        setTempRandomStoryData(storyData);
                        
                        // Afficher le modal de paramètres
                        setShowEroticismSlider(true);
                      }}
                      className="button-text bg-white/30 hover:bg-white/40 text-white px-4 py-1.5 rounded-full flex items-center"
                    >
                      Lancer
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Guidée */}
              <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <img src={guideeImg} alt="Guidée" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative p-4 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="mr-2 text-white bg-white/20 p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="title-card text-lg text-white truncate">Guidée</h3>
                    </div>
                    <p className="description-card text-sm text-white/90 mb-4">
                      Laisse-toi guider selon l'ambiance et la situation que tu choisis
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        logUserAction(
                          ANALYTICS_ACTIONS.STORY_MODE_SELECTED,
                          'HomePage',
                          { mode: 'guided', description: 'Guidée - scénario personnalisé' }
                        );
                        navigate('/custom-story');
                      }}
                      className="button-text bg-white/30 hover:bg-white/40 text-white px-4 py-1.5 rounded-full flex items-center"
                    >
                      Choisir
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Fantasmes */}
              <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <img src={fantasmeImg} alt="Fantasmes" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative p-4 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="mr-2 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </div>
                      <h3 className="title-card text-lg text-white truncate">Fantasmes</h3>
                    </div>
                    <p className="description-card text-sm text-white/90 mb-4">
                      Sélectionne tes envies, on s'occupe du reste...
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        logUserAction(
                          ANALYTICS_ACTIONS.STORY_MODE_SELECTED,
                          'HomePage',
                          { mode: 'fantasies', description: 'Fantasmes - sélection de catégories' }
                        );
                        navigate('/random-story-generator');
                      }}
                      className="button-text bg-white/30 hover:bg-white/40 text-white px-4 py-1.5 rounded-full flex items-center"
                    >
                      Sélectionner
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Libre */}
              <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <img src={libreImg} alt="Libre" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative p-4 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="mr-2 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <h3 className="title-card text-lg text-white truncate">Libre</h3>
                    </div>
                    <p className="description-card text-sm text-white/90 mb-4">
                      Transforme ton idée en une histoire érotique immersive.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        logUserAction(
                          ANALYTICS_ACTIONS.STORY_MODE_SELECTED,
                          'HomePage',
                          { mode: 'free', description: 'Libre - fantasme personnalisé' }
                        );
                        navigate('/free-fantasy');
                      }}
                      className="button-text bg-white/30 hover:bg-white/40 text-white px-4 py-1.5 rounded-full flex items-center"
                    >
                      Écrire
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="mt-8 text-center text-amber-200/50 text-xs">
              © 2025 MyDesire.now
            </div>
          </div>
        </div>
      </div>

      {/* Modal de paramètres pour le mode Mystère */}
      {showEroticismSlider && tempRandomStoryData && (
        <MysterySettingsModal
          initialReadingTime={2}
          initialEroticismLevel={2}
          onClose={() => setShowEroticismSlider(false)}
          onSubmit={({ readingTime, eroticismLevel }) => {
            // Mettre à jour les paramètres dans les données
            const updatedStoryData = {
              ...tempRandomStoryData,
              readingTime,
              eroticismLevel
            };
            
            // Stocker les données dans le localStorage pour les récupérer dans RandomStoryResult
            localStorage.setItem('randomStoryData', JSON.stringify(updatedStoryData));
            
            // Fermer le modal
            setShowEroticismSlider(false);
            
            // Rediriger vers la page de résultat
            navigate('/random-story-result');
          }}
        />
      )}
    </div>
  )
}

export default HomePage
