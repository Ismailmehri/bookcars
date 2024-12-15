const express = require('express');
const path = require('path');

const app = express();
const PORT = 80;

// Chemin de base pour le dossier des fichiers
const cdnBasePath = path.join(__dirname, 'cdn');

// Configurer les routes pour servir les fichiers statiques
app.use('../cdn', express.static(cdnBasePath));

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`CDN serveur est disponible sur http://localhost:${PORT}/cdn`);
});
