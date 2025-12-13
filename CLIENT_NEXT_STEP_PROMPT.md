# Prompt réutilisable pour migrer le frontend React vers Next.js

Le texte ci-dessous est prêt à être copié-collé pour demander une étape précise de la migration dans le dossier `client/`. Il rappelle le contexte du projet Plany/BookCars, les exigences de SEO et de tests, et le format attendu dans chaque réponse.

---

## Prompt
```
Je travaille sur une migration du frontend React actuel de mon projet (BookCars → plany.tn) vers Next.js.  
Le nouveau frontend sera dans un dossier `client/` à la racine du dépôt.  
L’objectif est de garder **le même design, la même UI/UX, les mêmes données affichées**, mais avec un **meilleur SEO (server side rendering / static site generation + meta tags)**.

Pour chaque demande ci-dessous :
1) Donne une **liste d’étapes claires et ordonnées**.
2) Pour chaque étape, précise :
   - Ce qu’il faut faire
   - Où créer le fichier
   - Quel code écrire (exemples complets)
   - Quelles commandes exécuter (CLI)
   - Comment valider visuellement et fonctionnellement
   - Comment ajouter les tests unitaires pour ce morceau
3) Conserve les conventions de design et les composants / styles existants.
4) Utilise Next.js (App Router ou Pages Router) selon le besoin.
5) Ajoute le SEO (meta tags, Open Graph, titres, descriptions, sitemap, performance).

---

### CONTEXTE
- Le projet est sur GitHub : https://github.com/Ismailmehri/bookcars.git
- Le dossier frontend actuel est React (CRA/Vite/etc.)
- Je ne veux pas migrer l’API ou le backend maintenant, seulement le frontend.
- Le premier fichier / page que je veux migrer est : **<INDIQUE_LE_FICHIER_OU_LA_PAGE>**

---

### TÂCHE À REMPLIR (remplace <…>)
Fournis les **étapes détaillées pour migrer ou créer** :
```

<INDIQUE_LE_FICHIER_OU_LA_PAGE>

```
dans le dossier `client/` Next.js, avec :
- Le code complet
- Le SEO
- Les tests unitaires
- Le routage Next.js
- La validation du rendu

---

### EXEMPLE DE REMPLISSAGE
Par exemple si je remplace la ligne ci-dessous par :
```

<INDIQUE_LE_FICHIER_OU_LA_PAGE> = "la page d’accueil avec SEO"

```
Tu dois répondre avec :
1) ✨ étapes
2) 📁 structure des fichiers
3) 🧠 code Next.js
4) 🧪 tests unitaires
5) 🚀 vérification SEO

---

### COMMENT L’UTILISER

1. Copie ce prompt.
2. Remplace `"<INDIQUE_LE_FICHIER_OU_LA_PAGE>"` par ce que tu veux migrer ensuite.
   Par exemple :

   * "page d’accueil avec SEO"
   * "le Header / Navbar"
   * "la page liste de voitures"
   * "le composant Footer"
3. Colle-le dans ChatGPT ou Codex.
4. Tu obtiendras une checklist + code + tests.

---

### EXEMPLES D’UTILISATION

- Pour migrer la page d’accueil :
```
<INDIQUE_LE_FICHIER_OU_LA_PAGE> = "la page d’accueil avec SEO"
```
- Pour migrer la page des voitures :
```
<INDIQUE_LE_FICHIER_OU_LA_PAGE> = "la page liste de voitures avec filtre et SEO"
```

---

Si besoin, je peux aussi préparer une version du prompt adaptée à Copilot / Code-GPT / Claude Code (optimisée pour la génération de fichiers complets).
```
