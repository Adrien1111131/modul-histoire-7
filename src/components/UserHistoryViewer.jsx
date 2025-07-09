import React, { useState, useEffect } from 'react';
import userHistoryService from '../services/userHistoryService';
import kinkCategories from '../data/kinkCategories';

const UserHistoryViewer = ({ userId, userName, onClose }) => {
  const [userHistory, setUserHistory] = useState(null);
  const [activeTab, setActiveTab] = useState('stories');
  const [selectedStory, setSelectedStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserHistory();
    }
  }, [userId]);

  const loadUserHistory = () => {
    setLoading(true);
    const history = userHistoryService.getUserHistory(userId);
    setUserHistory(history);
    setLoading(false);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const formatStoryType = (type) => {
    const types = {
      'random': 'Histoire Aléatoire',
      'custom': 'Histoire Personnalisée',
      'free': 'Fantasme Libre'
    };
    return types[type] || type;
  };

  const getCategoryForKink = (kinkName) => {
    for (const category of kinkCategories) {
      if (category.subcategories.includes(kinkName)) {
        return category.name;
      }
    }
    return 'Non catégorisé';
  };

  const exportUserData = () => {
    const dataStr = userHistoryService.exportUserHistory(userId);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historique_${userName}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Chargement de l'historique...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!userHistory) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-medium mb-4">Aucun historique trouvé</h3>
          <p className="text-gray-600 mb-4">
            Aucun historique n'a été trouvé pour cet utilisateur.
          </p>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Historique de {userName}
            </h2>
            <p className="text-sm text-gray-600">
              Membre depuis le {formatDate(userHistory.createdAt)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportUserData}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              Exporter JSON
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 px-6 border-b">
          <nav className="flex space-x-8">
            {[
              { id: 'stories', label: 'Histoires', count: userHistory.generatedStories?.length || 0 },
              { id: 'profile', label: 'Profil', count: 1 },
              { id: 'questionnaires', label: 'Questionnaires', count: Object.keys(userHistory.questionnaires || {}).length },
              { id: 'fantasies', label: 'Fantasmes', count: userHistory.selectedFantasies?.length || 0 },
              { id: 'texts', label: 'Textes libres', count: userHistory.freeTexts?.length || 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Onglet Histoires */}
          {activeTab === 'stories' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Histoires générées ({userHistory.generatedStories?.length || 0})
              </h3>
              
              {userHistory.generatedStories?.length > 0 ? (
                <div className="grid gap-4">
                  {userHistory.generatedStories.map((story, index) => (
                    <div key={story.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {formatStoryType(story.type)} #{index + 1}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(story.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedStory(story)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Voir le contenu
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Temps de lecture:</span> {story.parameters?.readingTime || 'N/A'} min
                        </div>
                        <div>
                          <span className="font-medium">Niveau d'érotisme:</span> {story.parameters?.eroticismLevel || 'N/A'}/5
                        </div>
                        <div>
                          <span className="font-medium">Longueur:</span> {story.content?.length || 0} caractères
                        </div>
                        <div>
                          <span className="font-medium">Fantasmes:</span> {story.parameters?.selectedKinks?.length || 0}
                        </div>
                      </div>
                      
                      {story.parameters?.selectedKinks?.length > 0 && (
                        <div className="mt-3">
                          <span className="font-medium text-sm">Fantasmes sélectionnés:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {story.parameters.selectedKinks.map((kink, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                {kink}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune histoire générée</p>
              )}
            </div>
          )}

          {/* Onglet Profil */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du profil</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Nom:</span>
                    <p className="text-gray-900">{userHistory.profile?.name || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-900">{userHistory.profile?.email || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Âge:</span>
                    <p className="text-gray-900">{userHistory.profile?.ageRange || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Genre:</span>
                    <p className="text-gray-900">{userHistory.profile?.gender || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Orientation:</span>
                    <p className="text-gray-900">{userHistory.profile?.orientation || 'Non spécifié'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Questionnaires */}
          {activeTab === 'questionnaires' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Réponses aux questionnaires</h3>
              
              {Object.entries(userHistory.questionnaires || {}).map(([type, questionnaire]) => (
                <div key={type} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 capitalize">
                    Questionnaire {type === 'sensory' ? 'Sensoriel' : 'Excitation'}
                  </h4>
                  
                  {questionnaire.completedAt && (
                    <p className="text-sm text-gray-500 mb-3">
                      Complété le {formatDate(questionnaire.completedAt)}
                    </p>
                  )}
                  
                  {questionnaire.questions?.length > 0 && questionnaire.answers ? (
                    <div className="space-y-3">
                      {questionnaire.questions.map((question, index) => (
                        <div key={index} className="bg-gray-50 rounded p-3">
                          <p className="font-medium text-sm text-gray-700 mb-1">
                            {question}
                          </p>
                          <p className="text-gray-900">
                            {questionnaire.answers[`question_${index}`] || 'Pas de réponse'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucune donnée de questionnaire disponible</p>
                  )}
                </div>
              ))}
              
              {Object.keys(userHistory.questionnaires || {}).length === 0 && (
                <p className="text-gray-500 text-center py-8">Aucun questionnaire complété</p>
              )}
            </div>
          )}

          {/* Onglet Fantasmes */}
          {activeTab === 'fantasies' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Fantasmes sélectionnés ({userHistory.selectedFantasies?.length || 0})
              </h3>
              
              {userHistory.selectedFantasies?.length > 0 ? (
                <div className="space-y-4">
                  {/* Grouper par catégorie */}
                  {Object.entries(
                    userHistory.selectedFantasies.reduce((acc, fantasy) => {
                      const category = getCategoryForKink(fantasy.subcategory);
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(fantasy);
                      return acc;
                    }, {})
                  ).map(([category, fantasies]) => (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                      <div className="grid gap-2">
                        {fantasies.map((fantasy, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 rounded p-2">
                            <span className="text-gray-900">{fantasy.subcategory}</span>
                            <div className="text-xs text-gray-500">
                              <span className="mr-2">{fantasy.context}</span>
                              <span>{formatDate(fantasy.timestamp)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun fantasme sélectionné</p>
              )}
            </div>
          )}

          {/* Onglet Textes libres */}
          {activeTab === 'texts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Textes libres saisis ({userHistory.freeTexts?.length || 0})
              </h3>
              
              {userHistory.freeTexts?.length > 0 ? (
                <div className="space-y-4">
                  {userHistory.freeTexts.map((text, index) => (
                    <div key={text.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {text.type.replace('_', ' ')}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(text.timestamp)}
                          </p>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {text.content.length} caractères
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {text.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun texte libre saisi</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal pour afficher le contenu d'une histoire */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {formatStoryType(selectedStory.type)} - {formatDate(selectedStory.timestamp)}
              </h3>
              <button
                onClick={() => setSelectedStory(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose max-w-none">
                {selectedStory.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHistoryViewer;
