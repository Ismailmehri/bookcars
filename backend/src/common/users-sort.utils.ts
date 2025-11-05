import type { GridSortModel } from '@mui/x-data-grid'
import type { UsersSortDescriptor, UsersSortableField } from ':bookcars-types'

const allowedSortFields: UsersSortableField[] = ['fullName', 'lastLoginAt', 'createdAt']
const allowedSortFieldsSet = new Set<UsersSortableField>(allowedSortFields)

export const sanitizeUsersSortModel = (model: GridSortModel, fallback: GridSortModel): GridSortModel => {
  const filtered = model.filter(
    (item) => Boolean(item.sort) && allowedSortFieldsSet.has(item.field as UsersSortableField),
  )

  if (filtered.length === 0) {
    return [...fallback]
  }

  const hasLastLogin = filtered.some((item) => item.field === 'lastLoginAt')
  const hasFullName = filtered.some((item) => item.field === 'fullName')

  if (hasLastLogin && !hasFullName) {
    return [...filtered, { field: 'fullName', sort: 'asc' }]
  }

  return filtered
}

export const sortModelsEqual = (a: GridSortModel, b: GridSortModel): boolean =>
  a.length === b.length && a.every((item, index) => item.field === b[index]?.field && item.sort === b[index]?.sort)

export const mapSortModelToApiSort = (model: GridSortModel): UsersSortDescriptor[] => {
  const result: UsersSortDescriptor[] = []
  const seen = new Set<UsersSortableField>()

  model.forEach((item) => {
    if (!item.sort) {
      return
    }

    const field = item.field as UsersSortableField
    if (!allowedSortFieldsSet.has(field) || seen.has(field)) {
      return
    }

    seen.add(field)
    result.push({
      field,
      direction: item.sort === 'desc' ? 'desc' : 'asc',
    })
  })

  return result
}
