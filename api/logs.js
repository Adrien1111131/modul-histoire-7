// Endpoint API pour gérer les logs utilisateur sur Vercel
import { promises as fs } from 'fs';
import path from 'path';

const LOGS_FILE = '/tmp/user_logs.json';

// Fonction pour lire les logs existants
async function readLogs() {
  try {
    const data = await fs.readFile(LOGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Si le fichier n'existe pas, retourner un tableau vide
    return [];
  }
}

// Fonction pour écrire les logs
async function writeLogs(logs) {
  try {
    await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur écriture logs:', error);
    return false;
  }
}

export default async function handler(req, res) {
  // Configurer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // Ajouter un nouveau log
      const newLog = req.body;
      
      // Ajouter timestamp et ID si manquants
      if (!newLog.id) {
        newLog.id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      if (!newLog.timestamp) {
        newLog.timestamp = new Date().toISOString();
      }

      const existingLogs = await readLogs();
      existingLogs.push(newLog);

      // Limiter à 10000 logs pour éviter de surcharger
      if (existingLogs.length > 10000) {
        existingLogs.splice(0, existingLogs.length - 10000);
      }

      const success = await writeLogs(existingLogs);
      
      if (success) {
        return res.status(200).json({ 
          status: 'success', 
          message: 'Log enregistré',
          totalLogs: existingLogs.length 
        });
      } else {
        return res.status(500).json({ 
          status: 'error', 
          message: 'Erreur lors de l\'enregistrement' 
        });
      }
    }

    if (req.method === 'GET') {
      // Récupérer tous les logs
      const logs = await readLogs();
      
      return res.status(200).json({
        status: 'success',
        logs: logs,
        totalLogs: logs.length,
        lastUpdated: logs.length > 0 ? logs[logs.length - 1].timestamp : null
      });
    }

    if (req.method === 'DELETE') {
      // Supprimer tous les logs
      const success = await writeLogs([]);
      
      if (success) {
        return res.status(200).json({ 
          status: 'success', 
          message: 'Tous les logs ont été supprimés' 
        });
      } else {
        return res.status(500).json({ 
          status: 'error', 
          message: 'Erreur lors de la suppression' 
        });
      }
    }

    // Méthode non supportée
    return res.status(405).json({ 
      status: 'error', 
      message: 'Méthode non autorisée' 
    });

  } catch (error) {
    console.error('Erreur API logs:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Erreur serveur interne',
      error: error.message 
    });
  }
}
