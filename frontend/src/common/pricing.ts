export const normalizePrice = (price: number): number => {
  if (Number.isFinite(price) && price >= 0) {
    return Number(price)
  }

  return 0
}

export const calculateDailyRate = (totalPrice: number, days: number): number => {
  const normalizedDays = Math.max(days, 1)
  const safeTotal = normalizePrice(totalPrice)

  return safeTotal / normalizedDays
}
