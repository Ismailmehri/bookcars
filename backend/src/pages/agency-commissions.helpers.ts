export const getDrawerSafePaddingTop = (basePadding: number): string => {
  if (!Number.isFinite(basePadding) || basePadding <= 0) {
    return 'calc(env(safe-area-inset-top, 0px) + 0px)'
  }

  const roundedPadding = Math.round(basePadding)
  return `calc(env(safe-area-inset-top, 0px) + ${roundedPadding}px)`
}

export default getDrawerSafePaddingTop
