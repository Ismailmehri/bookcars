import React from 'react'
import { strings as commonStrings } from '@/lang/common'

interface ErrorProps {
  message: string
  style?: React.CSSProperties
  homeLink?: boolean
}

const Error = ({ message, style, homeLink }: ErrorProps) => {
  if (homeLink) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen bg-gray-100 p-3 text-center"
        style={style}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-20 h-20 text-red-500 mb-2"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm1-11h-2v8h2V6z" />
        </svg>
        <h1 className="text-4xl font-bold mb-1 text-gray-800">
          {commonStrings.GENERIC_ERROR}
        </h1>
        <a
          href="/"
          className="mt-3 px-6 py-2 rounded-lg bg-primary text-white shadow-card"
        >
          {commonStrings.GO_TO_HOME}
        </a>
      </div>
    )
  }

  return (
    <div className="text-center text-red-500 p-1" style={style || {}}>
      <span>{message}</span>
    </div>
  )
}

export default Error
