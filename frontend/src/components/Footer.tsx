import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MailOutline } from '@mui/icons-material'
import { strings } from '@/lang/footer'
import SecurePayment from '@/assets/img/secure-payment.png'
import * as LocationService from '@/services/LocationService'
import * as bookcarsTypes from ':bookcars-types'
import '@/assets/css/footer.css'

const Footer = () => {
  const navigate = useNavigate()
  const [locations, setLocations] = useState<bookcarsTypes.Location[]>([])
  const PAGE_SIZE = 100

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const _page = 1 // Page par défaut
        const _keyword = '' // Optionnel, selon votre implémentation
        const data: bookcarsTypes.Result<bookcarsTypes.Location> | [] = await LocationService.getLocations(_keyword, _page, PAGE_SIZE)
        const _data = data && data.length > 0 && data[0] ? data[0].resultData.filter((location) => location && location.name && (location.name.includes('Aéroport') || location.name.includes('(Centre-ville)'))) : []

        setLocations(_data) // Assurez-vous que la réponse contient un champ `results`
      } catch (error) {
        console.error('Erreur lors de la récupération des locations:', error)
      }
    }

    fetchLocations()
  }, [])

  return (
    <div className="footer">
      <div className="header">Plany</div>
      <section className="main">
        <div className="main-section">
          <div className="title">{strings.CORPORATE}</div>
          <ul className="links">
            <li onClick={() => navigate('/about')}>{strings.ABOUT}</li>
            <li onClick={() => navigate('/tos')}>{strings.TOS}</li>
            <li onClick={() => navigate('/privacy')}>{strings.PRIVACY}</li>
          </ul>
        </div>
        <div className="main-section">
          <div className="title">{strings.RENT}</div>
          <ul className="links">
            {locations.length > 0 ? (
    locations.map((location) => (
      <li key={location._id}>
        {' '}
        {/* Ajout d'une clé unique */}
        <a
          href={`/search?pickupLocation=${location._id}`} // Lien cliquable
          onClick={(e) => {
            e.preventDefault() // Empêche le rechargement de la page
            navigate(`/search?pickupLocation=${location._id}`) // Navigation avec React Router
          }}
        >
          Location voiture à
          {' '}
          {location.name}
        </a>
      </li>
    ))
  ) : (
    <li>Chargement des locations...</li>
  )}
          </ul>
        </div>
        <div className="main-section">
          <div className="title">{strings.SUPPORT}</div>
          <ul className="links">
            <li onClick={() => navigate('/contact')}>{strings.CONTACT}</li>
          </ul>
          <div className="contact">
            <MailOutline className="icon" />
            <a href="mailto:info@plany.tn">info@plany.tn</a>
          </div>
          <div className="whatsapp-contact">
            <a
              href="https://wa.me/message/375AVPIE7SAUP1"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: '#25D366',
                marginTop: '10px',
              }}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                style={{ width: '24px', height: '24px', marginRight: '8px' }}
              />
              Contactez-nous sur WhatsApp
            </a>
          </div>
        </div>
      </section>
      <section className="payment">
        <div className="payment-text">{strings.SECURE_PAYMENT}</div>
        <img src={SecurePayment} alt="Paiement sécurisé" />
      </section>
      <section className="copyright">
        <div>
          <span>{strings.COPYRIGHT_PART1}</span>
          <span>{strings.COPYRIGHT_PART2}</span>
        </div>
      </section>
    </div>
  )
}

export default Footer
