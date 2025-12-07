/**
 * Génère un email HTML basé sur un template.
 *
 * @param {string} subject - Sujet de l'email.
 * @param {string} name - Nom de l'agence destinataire.
 * @returns {string} - Le contenu HTML complet de l'email.
 */
export const templateAfterValidation = (subject: string, name: string): string => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${subject}</title>
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      background-color: #f8f8fc;
      color: #0f172a;
      font-family: 'Open Sans', Arial, sans-serif;
    }

    .container {
      max-width: 640px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    .card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(26, 92, 255, 0.08);
      padding: 32px;
      box-sizing: border-box;
    }

    h1 {
      color: #1a5cff;
      font-size: 22px;
      margin: 0 0 12px;
      line-height: 1.4;
      font-weight: 700;
      text-align: left;
    }

    h2 {
      color: #0f172a;
      font-size: 18px;
      margin: 24px 0 8px;
      line-height: 1.4;
      font-weight: 700;
    }

    p {
      margin: 0 0 16px;
      line-height: 1.6;
      font-size: 14px;
    }

    ul {
      padding-left: 18px;
      margin: 0 0 16px;
    }

    li {
      margin-bottom: 8px;
      line-height: 1.6;
      font-size: 14px;
    }

    .section {
      border-left: 4px solid #1a5cff;
      padding-left: 12px;
      margin: 20px 0;
    }

    .footer {
      margin-top: 24px;
      font-size: 13px;
      color: #334155;
    }

    @media only screen and (max-width: 620px) {
      .card {
        padding: 24px 20px;
      }

      h1 {
        font-size: 20px;
      }

      h2 {
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>${subject}</h1>
      <p><strong>Bonjour ${name},</strong></p>
      <p>Votre compte Plany a été activé avec succès.<br />Pour garantir une expérience fiable aux clients et respecter les politiques de Plany.tn, certaines informations sont obligatoires et doivent être tenues à jour en permanence.</p>
      <p><strong>Merci de lire attentivement les points suivants.</strong></p>

      <div class="section">
        <h2>Étape 1 : Complétez le profil de votre agence</h2>
        <ul>
          <li>Ajoutez le nom complet de votre agence.</li>
          <li>Ajoutez votre logo (taille recommandée : 60x30).</li>
        </ul>
        <p>Ces éléments renforcent la crédibilité de votre agence auprès des clients.</p>
      </div>

      <div class="section">
        <h2>Étape 2 : Ajoutez vos voitures avec les bons prix et les bonnes périodes</h2>
        <p>Pour que vos véhicules apparaissent dans les résultats de recherche, vous devez impérativement :</p>
        <ul>
          <li>Ajouter vos voitures dans l’onglet «&nbsp;Voitures&nbsp;».</li>
          <li>Ajouter une image claire et de bonne qualité (taille recommandée : 300x200).</li>
          <li>Ajouter les lieux de prise en charge disponibles.</li>
          <li>Définir le prix par jour et les prix par période (saisons).</li>
        </ul>
        <p>Sur Plany.tn, les prix varient fortement selon la saison. Il est donc obligatoire de configurer les prix par période, par exemple :</p>
        <ul>
          <li>Haute saison été</li>
          <li>Période du 15/12 au 02/01</li>
          <li>Autres périodes spécifiques (week-ends, jours fériés, etc.)</li>
        </ul>
        <p>Des prix clairs par période permettent d’éviter les malentendus avec les clients et de respecter la transparence exigée par Plany.</p>
      </div>

      <div class="section">
        <h2>Étape 3 : Mettez à jour les statuts de vos voitures (obligatoire)</h2>
        <p>Pour chaque voiture, vous devez maintenir à jour son statut de disponibilité :</p>
        <ul>
          <li>Cochez «&nbsp;Disponible à la location&nbsp;» uniquement si la voiture est réellement disponible.</li>
          <li>Désactivez la voiture immédiatement si :
            <ul>
              <li>elle est déjà louée sur une autre plateforme,</li>
              <li>elle est en panne,</li>
              <li>elle est vendue,</li>
              <li>ou n’est plus proposée à la location.</li>
            </ul>
          </li>
        </ul>
        <p>Vous devez également mettre à jour vos statuts après chaque changement :</p>
        <ul>
          <li>Nouvelle réservation confirmée</li>
          <li>Annulation</li>
          <li>Modification de disponibilité</li>
        </ul>
        <p><strong>Important :</strong><br />Plany surveille la fiabilité des agences.<br />Si nous constatons des voitures affichées comme disponibles alors qu’elles ne le sont pas, des réservations ignorées ou des statuts non mis à jour, votre compte pourra être limité, masqué des résultats ou temporairement bloqué.</p>
      </div>

      <div class="section">
        <h2>Étape 4 : Paramétrez vos politiques</h2>
        <p>Merci de définir clairement dans votre compte :</p>
        <ul>
          <li>Le montant du dépôt de garantie (caution)</li>
          <li>Les frais d’annulation (si applicables)</li>
          <li>Les frais de modification (si applicables)</li>
        </ul>
        <p>Ces informations sont indispensables pour que le client sache à quoi s’attendre avant de réserver.</p>
      </div>

      <p><strong>Besoin d’aide ?</strong><br />Notre équipe est disponible si vous avez besoin d’accompagnement pour configurer vos voitures ou vos prix : <a href="mailto:contact@plany.tn" style="color: #1a5cff; text-decoration: underline;">contact@plany.tn</a></p>
      <p class="footer">Merci de votre collaboration.<br />En respectant ces règles, vous améliorez vos chances de recevoir des demandes de réservation de qualité et vous contribuez à la fiabilité de Plany.tn.<br /><br />L’équipe Plany</p>
    </div>
  </div>
</body>
</html>
`
