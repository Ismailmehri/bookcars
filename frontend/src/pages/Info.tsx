import React from 'react'
import Seo from '@/components/Seo'
import { strings as commonStrings } from '@/lang/common'

interface InfoProps {
  className?: string
  message: string
  hideLink?: boolean
  style?: React.CSSProperties
  type?: 'success' | 'warning' | 'info'
}

const Info = ({ className, message, hideLink, style, type }: InfoProps) => {
  // Détermine l'icône à afficher en fonction du type
  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <span className="text-green-500 text-4xl mr-2">✔️</span>
      case 'warning':
        return <span className="text-orange-500 text-4xl mr-2">⚠️</span>
      case 'info':
        return <span className="text-blue-500 text-4xl mr-2">ℹ️</span>
      default:
        return null
    }
  }

  return (
    <>
      <Seo robots="noindex,nofollow" />
      <div
        style={style}
        className={`${className ? `${className} ` : ''}fixed inset-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-2`}
      >
        <div className="bg-white p-5 rounded-lg shadow-lg text-center max-w-xl w-full">
          <div className="flex items-center justify-center mb-4">
            {renderIcon()}
            <p className="text-lg text-gray-800 m-0">{message}</p>
          </div>
          {!hideLink && (
            <a href="/" className="text-blue-600 font-bold hover:underline">
              {commonStrings.GO_TO_HOME}
            </a>
          )}
        </div>
      </div>
    </>
  )
}

export default Info
