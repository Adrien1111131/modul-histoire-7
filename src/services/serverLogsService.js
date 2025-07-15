// Service pour envoyer/recevoir les logs depuis le serveur Vercel
const API_BASE = 'https://modul-histoire-7.vercel.app/api';

export const sendLogToServer = async (logData) => {
  try {
    const response = await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });
    return await response.json();
  } catch (error) {
    console.error('Erreur envoi logs:', error);
    return { status: 'error', error };
  }
};

export const getServerLogs = async () => {
  try {
    const response = await fetch(`${API_BASE}/logs`);
    return await response.json();
  } catch (error) {
    console.error('Erreur récupération logs:', error);
    return [];
  }
};

export const clearServerLogs = async () => {
  try {
    const response = await fetch(`${API_BASE}/logs`, {
      method: 'DELETE'
    });
    return await response.json();
  } catch (error) {
    console.error('Erreur suppression logs:', error);
    return { status: 'error', error };
  }
};

export default {
  sendLogToServer,
  getServerLogs,
  clearServerLogs
};
