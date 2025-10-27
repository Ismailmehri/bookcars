export const SEARCH_CONTENT_MAX_WIDTH = 980

export const getSearchContentMaxWidth = (isMobile: boolean) => (isMobile ? '100%' : `${SEARCH_CONTENT_MAX_WIDTH}px`)
