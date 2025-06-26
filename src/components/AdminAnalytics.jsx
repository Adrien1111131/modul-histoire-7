import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import analyticsService from '../services/analyticsService';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLogs, setUserLogs] = useState([]);
  const [view, setView] = useState('overview'); // 'overview', 'users', 'user-detail'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // 'all', 'profile', 'questionnaire', etc.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // Mot de passe simple pour protéger l'accès
  const ADMIN_PASSWORD = 'analytics2025';

  // Catégories d'actions pour le filtrage
  const actionCategories = {
    all: 'Toutes les actions',
    profile: 'Profil',
    questionnaire: 'Questionnaires',
    guided: 'Mode Guidé',
    mystery: 'Mode Mystère',
    kinks: 'Mode Fantasmes',
    free: 'Mode Libre',
    parameters: 'Paramètres',
    generation: 'Génération',
    navigation: 'Navigation'
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const loadData = () => {
    const globalStats = analyticsService.getGlobalStats();
    const usersList = analyticsService.getUsersList();
    
    setStats(globalStats);
    setUsers(usersList);
  };

  const handleUserSelect = (userId) => {
    const logs = analyticsService.getUserLogs(userId);
    const user = users.find(u => u.userId === userId);
    
    setSelectedUser(user);
    setUserLogs(logs);
    setView('user-detail');
  };

  const handleExportCSV = () => {
    const csvContent = analyticsService.exportLogsToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const formatActionName = (action) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionCategory = (action) => {
    if (action.startsWith('profile_')) return 'profile';
    if (action.includes('questionnaire') || action.includes('question_answered')) return 'questionnaire';
    if (action.startsWith('guided_')) return 'guided';
    if (action.startsWith('mystery_')) return 'mystery';
    if (action.includes('kink')) return 'kinks';
    if (action.includes('free_fantasy')) return 'free';
    if (action.includes('time') || action.includes('level')) return 'parameters';
    if (action.includes('story_') || action.includes('generated')) return 'generation';
    if (action.includes('visited') || action.includes('clicked') || action.includes('modal')) return 'navigation';
    return 'all';
  };

  const getActionColor = (action) => {
    const category = getActionCategory(action);
    const colors = {
      profile: 'bg-green-100 text-green-800',
      questionnaire: 'bg-blue-100 text-blue-800',
      guided: 'bg-purple-100 text-purple-800',
      mystery: 'bg-pink-100 text-pink-800',
      kinks: 'bg-red-100 text-red-800',
      free: 'bg-yellow-100 text-yellow-800',
      parameters: 'bg-indigo-100 text-indigo-800',
      generation: 'bg-cyan-100 text-cyan-800',
      navigation: 'bg-gray-100 text-gray-800'
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredUsers = users.filter(user => 
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = userLogs.filter(log => {
    if (filterAction !== '') return log.action === filterAction;
    if (filterCategory !== 'all') return getActionCategory(log.action) === filterCategory;
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Administration Analytics</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez le mot de passe"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setView('overview')}
                  className={`px-3 py-1 rounded-md text-sm ${view === 'overview' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setView('users')}
                  className={`px-3 py-1 rounded-md text-sm ${view === 'users' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Utilisatrices
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                Exporter CSV
              </button>
              <button
                onClick={() => navigate('/home')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                Retour à l'app
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vue d'ensemble */}
        {view === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Logs</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalLogs}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Utilisatrices</h3>
                <p className="text-3xl font-bold text-green-600">{stats.uniqueUsers}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sessions</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.uniqueSessions}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Période</h3>
                <p className="text-sm text-gray-600">
                  {stats.dateRange.first ? formatDate(stats.dateRange.first).split(' ')[0] : 'N/A'}
                  <br />
                  au {stats.dateRange.last ? formatDate(stats.dateRange.last).split(' ')[0] : 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Actions les plus fréquentes */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions les plus fréquentes</h3>
                <div className="space-y-2">
                  {Object.entries(stats.actionCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([action, count]) => (
                      <div key={action} className="flex justify-between items-center">
                        <span className={`text-sm px-2 py-1 rounded-full ${getActionColor(action)}`}>
                          {formatActionName(action)}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Composants les plus utilisés */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Composants les plus utilisés</h3>
                <div className="space-y-2">
                  {Object.entries(stats.componentCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([component, count]) => (
                      <div key={component} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{component}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des utilisatrices */}
        {view === 'users' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Liste des utilisatrices</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisatrice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sessions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernière activité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                            <div className="text-xs text-gray-400">{user.userId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.userEmail || 'Non spécifié'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.userGender}</div>
                          <div className="text-sm text-gray-500">{user.userAgeRange}</div>
                          <div className="text-sm text-gray-500">{user.userOrientation}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.totalActions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.totalSessions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.lastActivity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleUserSelect(user.userId)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Détail utilisatrice */}
        {view === 'user-detail' && selectedUser && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedUser.userName}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedUser.totalActions} actions • {selectedUser.totalSessions} sessions
                  </p>
                </div>
                <button
                  onClick={() => setView('users')}
                  className="text-blue-600 hover:text-blue-900"
                >
                  ← Retour à la liste
                </button>
              </div>

              {/* Informations utilisatrice */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Profil</h4>
                  <div className="space-y-1">
                    <p className="text-sm">Email: {selectedUser.userEmail}</p>
                    <p className="text-sm">Genre: {selectedUser.userGender}</p>
                    <p className="text-sm">Âge: {selectedUser.userAgeRange}</p>
                    <p className="text-sm">Orientation: {selectedUser.userOrientation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Préférences</h4>
                  <div className="space-y-1">
                    <p className="text-sm">Style dominant: {selectedUser.dominantStyle}</p>
                    <p className="text-sm">Type d'excitation: {selectedUser.excitationType}</p>
                  </div>
                </div>
              </div>

              {/* Filtres */}
              <div className="mb-4 flex space-x-4">
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setFilterAction('');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(actionCategories).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>

                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les actions</option>
                  {[...new Set(userLogs
                    .filter(log => filterCategory === 'all' || getActionCategory(log.action) === filterCategory)
                    .map(log => log.action))]
                    .map(action => (
                      <option key={action} value={action}>{formatActionName(action)}</option>
                    ))}
                </select>
              </div>

              {/* Timeline des actions */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {formatActionName(log.action)}
                        </span>
                        <span className="text-sm text-gray-500">{log.component}</span>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(log.timestamp)}</span>
                    </div>
                    {Object.keys(log.data).length > 0 && (
                      <div className="mt-2">
                        <details className="text-sm">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                            Voir les données ({Object.keys(log.data).length} propriétés)
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
