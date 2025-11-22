export type SupplierListState = 'loading' | 'error'

interface SupplierFallbackCopy {
  title: string
  description: string
  action?: string
}

export const getSupplierFallbackCopy = (
  state: SupplierListState,
  strings: {
    SUPPLIERS_TITLE: string
    SUPPLIERS_LOADING: string
    SUPPLIERS_ERROR: string
    SUPPLIERS_RETRY: string
  }
): SupplierFallbackCopy => {
  if (state === 'error') {
    return {
      title: strings.SUPPLIERS_TITLE,
      description: strings.SUPPLIERS_ERROR,
      action: strings.SUPPLIERS_RETRY,
    }
  }

  return {
    title: strings.SUPPLIERS_TITLE,
    description: strings.SUPPLIERS_LOADING,
  }
}
