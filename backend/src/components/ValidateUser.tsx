import React from 'react'
import { Button } from '@mui/material'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import { strings } from '@/lang/master'

import '@/assets/css/validate-user.css'

interface ValidateEmailProps {
  message: string;
  withButton: boolean;
  onResend: (e: React.MouseEvent<HTMLElement>) => void; // Accepte un événement en paramètre
}

const ValidateEmail = ({ message, withButton = true, onResend }: ValidateEmailProps) => (
  <div className="validate-email-overlay">
    <div className="validate-email-container">
      <div className="validate-email-content">
        <MailOutlineIcon style={{ fontSize: '2rem', color: '#007bff', marginBottom: '10px' }} />
        <span className="validate-email-message">{message}</span>
      </div>
      {withButton && ( // Affiche le bouton uniquement si withButton est true
        <Button
          type="button"
          variant="contained"
          size="small"
          className="btn-resend"
          onClick={onResend} // Fonction avec événement
          style={{ marginTop: '15px' }}
        >
          {strings.RESEND}
        </Button>
      )}
    </div>
  </div>
)

export default ValidateEmail
