import React from 'react'
import { Link } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import InfoIcon from '@mui/icons-material/Info'
import { strings as commonStrings } from '@/lang/common'

import '@/assets/css/info.css'

interface InfoProps {
  className?: string;
  message: string;
  hideLink?: boolean;
  style?: React.CSSProperties;
  type?: 'success' | 'warning' | 'info'; // Type pour afficher une icône spécifique
}

const Info = ({ className, message, hideLink, style, type }: InfoProps) => {
  // Détermine l'icône à afficher en fonction du type
  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon style={{ color: 'green', fontSize: '3rem', marginRight: '10px' }} />
      case 'warning':
        return <ErrorIcon style={{ color: 'orange', fontSize: '3rem', marginRight: '10px' }} />
      case 'info':
        return <InfoIcon style={{ color: 'blue', fontSize: '3rem', marginRight: '10px' }} />
      default:
        return null
    }
  }

  return (
    <div style={style} className={`${className ? `${className} ` : ''}info-overlay`}>
      <div className="info-container">
        <div className="info-content">
          {renderIcon()}
          <p className="info-message">{message}</p>
        </div>
        {!hideLink && (
          <Link href="/" className="info-link">
            {commonStrings.GO_TO_HOME}
          </Link>
        )}
      </div>
    </div>
  )
}

export default Info
