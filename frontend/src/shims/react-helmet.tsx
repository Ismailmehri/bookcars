import React, { ReactElement, ReactNode, useEffect } from 'react'

type HelmetChild = ReactElement<{
  children?: ReactNode
} & { [key: string]: unknown }>

export interface HelmetProps {
  children?: ReactNode
}

const extractTextContent = (content: ReactNode): string => {
  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content.map((item) => extractTextContent(item)).join('')
  }

  if (React.isValidElement(content)) {
    return extractTextContent(content.props.children)
  }

  return ''
}

const setAttributes = (element: HTMLElement, props: Record<string, unknown>) => {
  Object.entries(props).forEach(([key, value]) => {
    if (value == null || key === 'children') {
      return
    }

    if (key === 'className' && typeof value === 'string') {
      element.setAttribute('class', value)
      return
    }

    element.setAttribute(key, String(value))
  })
}

const Helmet = ({ children }: HelmetProps) => {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined
    }

    const createdElements: HTMLElement[] = []

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) {
        return
      }

      const typedChild = child as HelmetChild
      const { type, props } = typedChild

      if (typeof type !== 'string') {
        return
      }

      if (type === 'title') {
        const titleText = extractTextContent(props.children ?? null)
        if (titleText) {
          document.title = titleText
        }
        return
      }

      const element = document.createElement(type)
      setAttributes(element, props)
      const textContent = extractTextContent(props.children ?? null)
      if (textContent) {
        element.textContent = textContent
      }

      document.head.appendChild(element)
      createdElements.push(element)
    })

    return () => {
      createdElements.forEach((element) => {
        if (element.parentNode === document.head) {
          document.head.removeChild(element)
        }
      })
    }
  }, [children])

  return null
}

export { Helmet }
