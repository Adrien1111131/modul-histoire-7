import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import fondStart from '/fond start.png';
import profileService from '../services/profileService';
import { logUserAction, ANALYTICS_ACTIONS } from '../services/analyticsService';

const PersonalInfoForm = ({ onSubmit }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    ageRange: '18 - 25 ans',
    gender: 'Femme',
    orientation: 'Bi-sexuelle'
  });

  // Vérifier si on est en mode édition (paramètre edit dans l'URL)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    
    if (editId) {
      setIsEditMode(true);
      setProfileId(editId);
      
      // Charger les données du profil à modifier
      const profileData = profileService.getProfileById(editId);
      if (profileData) {
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          ageRange: profileData.ageRange || '18 - 25 ans',
          gender: profileData.gender || 'Femme',
          orientation: profileData.orientation || 'Bi-sexuelle'
        });
      }
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditMode && profileId) {
      // Mettre à jour le profil existant
      profileService.updateProfile(profileId, formData);
      
      // Log de la mise à jour du profil
      logUserAction(
        ANALYTICS_ACTIONS.PROFILE_UPDATED,
        'PersonalInfoForm',
        { profileId, ...formData },
        { isEditMode: true }
      );
      
      navigate('/home'); // Retourner à la page d'accueil après modification
    } else {
      // Créer un nouveau profil
      const newProfile = profileService.saveProfile(formData);
      
      // Log de la création du profil
      logUserAction(
        ANALYTICS_ACTIONS.PROFILE_CREATED,
        'PersonalInfoForm',
        { profileId: newProfile.id, ...formData },
        { isEditMode: false }
      );
      
      if (onSubmit) {
        onSubmit(formData);
      }
      navigate('/sensory-questionnaire');
    }
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
              <h2 className="text-3xl font-serif text-center mb-4">
                {isEditMode ? 'Modifier mon profil' : 'Mon profil'}
              </h2>
              
              <p className="text-amber-100 text-sm mb-8">
                Vos données sont strictement confidentielles et entièrement protégées : nous les utilisons 
                uniquement pour vous offrir un service de qualité, en toute sécurité.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label htmlFor="name" className="block text-amber-100 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Magalie"
                    className="w-full px-3 py-2 bg-amber-200/30 border border-amber-300/50 rounded-md text-white placeholder-amber-200/70 focus:outline-none focus:ring-2 focus:ring-amber-300"
                    required
                  />
                  <p className="text-xs text-amber-200/70 mt-1">
                    sera utilisé pour la personnalisation des histoires
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-amber-100 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="magalie@exemple.com"
                    className="w-full px-3 py-2 bg-amber-200/30 border border-amber-300/50 rounded-md text-white placeholder-amber-200/70 focus:outline-none focus:ring-2 focus:ring-amber-300"
                    required
                  />
                  <p className="text-xs text-amber-200/70 mt-1">
                    pour ne rien manquer de nos mises à jour et améliorations
                  </p>
                </div>

                <div>
                  <label htmlFor="ageRange" className="block text-amber-100 mb-2">
                    Tranche d'âge
                  </label>
                  <select
                    id="ageRange"
                    name="ageRange"
                    value={formData.ageRange}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-amber-200/30 border border-amber-300/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-300 appearance-none"
                    required
                  >
                    <option value="18 - 25 ans">18 - 25 ans</option>
                    <option value="26 - 35 ans">26 - 35 ans</option>
                    <option value="36 - 45 ans">36 - 45 ans</option>
                    <option value="46 - 55 ans">46 - 55 ans</option>
                    <option value="56 ans et plus">56 ans et plus</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="gender" className="block text-amber-100 mb-2">
                    Sexe
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-amber-200/30 border border-amber-300/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-300 appearance-none"
                    required
                  >
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Non-binaire">Non-binaire</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="orientation" className="block text-amber-100 mb-2">
                    Orientation sexuelle
                  </label>
                  <select
                    id="orientation"
                    name="orientation"
                    value={formData.orientation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-amber-200/30 border border-amber-300/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-300 appearance-none"
                    required
                  >
                    <option value="Hétérosexuel(le)">Hétérosexuel(le)</option>
                    <option value="Homosexuel(le)">Homosexuel(le)</option>
                    <option value="Bi-sexuelle">Bi-sexuelle</option>
                    <option value="Pansexuel(le)">Pansexuel(le)</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(isEditMode ? '/home' : '/')}
                    className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-400 transition-colors"
                  >
                    {isEditMode ? 'Enregistrer' : 'Continuer'}
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

export default PersonalInfoForm;
