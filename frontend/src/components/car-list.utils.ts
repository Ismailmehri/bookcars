interface CarListSectionClassOptions {
  className?: string
  isMobile: boolean
}

export const buildCarListSectionClassName = ({ className, isMobile }: CarListSectionClassOptions) => {
  const classes: string[] = []

  if (className?.trim()) {
    classes.push(className.trim())
  }

  classes.push('car-list')

  if (isMobile) {
    classes.push('car-list-mobile')
  }

  return classes.join(' ')
}

export type { CarListSectionClassOptions }
