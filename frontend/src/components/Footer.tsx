import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MailOutline } from '@mui/icons-material'
import { Button } from '@mui/material'
import { strings } from '@/lang/footer'
import SecurePayment from '@/assets/img/secure-payment.png'
import * as LocationService from '@/services/LocationService'
import * as bookcarsTypes from ':bookcars-types'
import '@/assets/css/footer.css'

interface FooterProps {
  loadLocations?: () => Promise<bookcarsTypes.Location[]>
  prefetchedLocations?: bookcarsTypes.Location[]
}

const PAGE_SIZE = 100

const defaultLoadLocations = async (): Promise<bookcarsTypes.Location[]> => {
  const _page = 1
  const _keyword = ''
  const data: bookcarsTypes.Result<bookcarsTypes.Location> | [] = await LocationService.getLocations(
    _keyword,
    _page,
    PAGE_SIZE
  )
  const _data = data && data.length > 0 && data[0]
    ? data[0].resultData.filter(
      (location) => location && location.name && (location.name.includes('Aéroport') || location.name.includes('(Centre-ville)'))
    )
    : []

  return _data
}

const Footer = ({ loadLocations = defaultLoadLocations, prefetchedLocations = [] }: FooterProps) => {
  const navigate = useNavigate()
  const [locations, setLocations] = useState<bookcarsTypes.Location[]>(prefetchedLocations)
  const [loading, setLoading] = useState(prefetchedLocations.length === 0)
  const [error, setError] = useState('')

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const fetchedLocations = await loadLocations()
      setLocations(fetchedLocations)
    } catch (err) {
      setError(strings.ERROR)
    } finally {
      setLoading(false)
    }
  }, [loadLocations])

  useEffect(() => {
    if (prefetchedLocations.length === 0) {
      fetchLocations()
    }
  }, [fetchLocations, prefetchedLocations])

  const renderLocations = () => {
    if (loading) {
      return (
        <ul className="footer__links" aria-live="polite">
          {Array.from({ length: 3 }).map((_, index) => (
            <li className="footer__skeleton" key={`placeholder-${index}`} />
          ))}
        </ul>
      )
    }

    if (error) {
      return (
        <div className="footer__message" role="status" aria-live="assertive">
          <span>{error}</span>
          <Button variant="outlined" size="small" onClick={fetchLocations}>
            {strings.RETRY}
          </Button>
        </div>
      )
    }

    if (locations.length === 0) {
      return (
        <div className="footer__message" role="status" aria-live="polite">
          {strings.EMPTY_LOCATIONS}
        </div>
      )
    }

    return (
      <ul className="footer__links" aria-label={strings.RENT}>
        {locations.map((location) => (
          <li key={location._id}>
            <a
              href={`/search/${location.slug}`}
              onClick={(e) => {
                e.preventDefault()
                navigate(`/search/${location.slug}`)
              }}
            >
              {`${strings.RENT_PREFIX} ${location.name}`}
            </a>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <footer className="footer" aria-label={strings.CORPORATE}>
      <div className="footer__brand">Plany</div>
      <div className="footer__grid">
        <div className="footer__column">
          <h3>{strings.CORPORATE}</h3>
          <ul className="footer__links">
            <li><button type="button" onClick={() => navigate('/about')}>{strings.ABOUT}</button></li>
            <li><button type="button" onClick={() => navigate('/tos')}>{strings.TOS}</button></li>
            <li><button type="button" onClick={() => navigate('/privacy')}>{strings.PRIVACY}</button></li>
            <li>
              <a href="https://blog.plany.tn" target="_blank" rel="noreferrer">
                Blog
              </a>
            </li>
          </ul>
        </div>

        <div className="footer__column">
          <h3>{strings.RENT}</h3>
          {renderLocations()}
        </div>

        <div className="footer__column footer__support">
          <h3>{strings.SUPPORT}</h3>
          <ul className="footer__links">
            <li><button type="button" onClick={() => navigate('/contact')}>{strings.CONTACT}</button></li>
          </ul>
          <div className="footer__contact">
            <MailOutline className="footer__icon" />
            <a href="mailto:info@plany.tn">info@plany.tn</a>
          </div>
          <a
            className="footer__whatsapp"
            href="https://wa.me/message/375AVPIE7SAUP1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="footer__whatsapp-icon" aria-hidden="true">📱</span>
            Contactez-nous sur WhatsApp
          </a>
        </div>
      </div>

      <div className="footer__payment">
        <div className="footer__payment-text">{strings.SECURE_PAYMENT}</div>
        <img src={SecurePayment} alt="Paiement sécurisé" />
      </div>

      <div className="footer__copyright">
        <span>{strings.COPYRIGHT_PART1}</span>
        <span>{strings.COPYRIGHT_PART2}</span>
      </div>
    </footer>
  )
}

export default Footer
