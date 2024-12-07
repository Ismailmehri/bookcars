import * as env from '../../config/env.config'

/**
 * Génère un email HTML basé sur un template.
 *
 * @param {string} subject - Sujet de l'email.
 * @param {string} body - Contenu principal de l'email.
 * @param {string} [actionUrl] - Lien d'action ou bouton.
 * @returns {string} - Le contenu HTML complet de l'email.
 */
export const generateEmailTemplate = (subject: string | Buffer | undefined, body: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    .email-body a.button {
      display: inline-block;
      margin: 10px 0px 10px 0px;
      padding: 4px 30px;
      background-color: #fff; /* Fond blanc */
      color: #1976d2; /* Texte bleu */
      border: 2px solid #1976d2; /* Bordure bleue */
      text-decoration: none;
      font-size: 1rem;
      border-radius: 5px;
      font-weight: bold;
      text-align: center;
      transition: all 0.3s ease; /* Transition fluide */
    }
    .email-body a.button:hover {
      background-color: #1976d2; /* Fond bleu au survol */
      color: #fff; /* Texte blanc au survol */
      border-color: #1976d2;
    }
    .email-header {
      background: #1976d2;
      color: #ffffff;
      padding: 20px;
      text-align: center;
      font-size: 1.2rem;
      font-weight: bold;
    }
    .email-body {
      padding: 20px;
      line-height: 1.8;
      font-size: 1rem;
    }
    .email-body p {
      margin: 0 0 15px;
    }
    .email-body a.button {
      display: inline-block;
      margin: 10px 0px 10px 0px;
      padding: 4px 30px;
      background: #1976d2;
      color: #ffffff;
      text-decoration: none;
      font-size: 1rem;
      border-radius: 5px;
    }
    .email-footer {
      background: #f1f1f1;
      color: #666;
      padding: 15px;
      text-align: center;
      font-size: 0.875rem;
    }
    .email-footer a {
      color: #1976d2;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      ${subject}
    </div>
    <div class="email-body">
      ${body}
    </div>
    <div class="email-footer">
      Cordialement,<br>
      L'équipe Plany<br>
      <a href="${env.FRONTEND_HOST}">Plany.tn</a>
    </div>
  </div>
</body>
</html>
`
