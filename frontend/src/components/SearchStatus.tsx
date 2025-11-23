import React from 'react'

import '@/assets/css/search-status.css'

type SearchStatusType = 'loading' | 'error'

interface SearchStatusProps {
  status: SearchStatusType
  message?: string
  onRetry?: () => void
}

const SearchStatus = ({ status, message, onRetry }: SearchStatusProps) => (
  <div className={`search-status search-status--${status}`} role={status === 'error' ? 'alert' : 'status'} aria-live="polite">
    <div className="search-status__content">
      <p className="search-status__title">{status === 'loading' ? 'Préparation de votre recherche…' : 'Une erreur est survenue'}</p>
      <p className="search-status__message">
        {message || (status === 'loading' ? 'Merci de patienter pendant que nous récupérons les meilleures offres.' : 'Impossible de charger les résultats pour le moment.')}
      </p>
    </div>
    {status === 'error' && onRetry && (
      <button type="button" className="search-status__cta" onClick={onRetry} aria-label="Réessayer la recherche">
        Réessayer
      </button>
    )}
  </div>
)

export default SearchStatus
