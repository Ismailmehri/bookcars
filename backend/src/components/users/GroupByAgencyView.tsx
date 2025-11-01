import React, { useMemo } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
  Button,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VisibilityIcon from '@mui/icons-material/Visibility'
import * as bookcarsTypes from ':bookcars-types'
import { strings as usersStrings } from '@/lang/users'
import { formatDateTime } from '@/common/format'

interface GroupByAgencyViewProps {
  users: bookcarsTypes.User[]
  onViewReviews: (user: bookcarsTypes.User) => void
  onToggleActive: (user: bookcarsTypes.User, active: boolean) => void
  isAdmin: boolean
}

const GroupByAgencyView = ({ users, onViewReviews, onToggleActive, isAdmin }: GroupByAgencyViewProps) => {
  const groups = useMemo(() => {
    const grouped = new Map<string, { agencyName: string; members: bookcarsTypes.User[]; reviews: number }>()
    users.forEach((user) => {
      const key = user.supplier && typeof user.supplier === 'string' ? user.supplier : (user.supplier?._id || user._id || 'unknown')
      const agencyName = user.agencyName || (typeof user.supplier !== 'string' && user.supplier?.fullName) || usersStrings.UNKNOWN_AGENCY
      if (!grouped.has(key)) {
        grouped.set(key, { agencyName, members: [], reviews: 0 })
      }
      const entry = grouped.get(key)
      if (entry) {
        entry.members.push(user)
        entry.reviews += Number(user.reviewsCount || 0)
      }
    })
    return Array.from(grouped.values()).sort((a, b) => a.agencyName.localeCompare(b.agencyName))
  }, [users])

  return (
    <Stack spacing={2} sx={{ px: { xs: 0, md: 2 }, pb: 4 }}>
      {groups.map((group) => (
        <Accordion key={group.agencyName} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Typography variant="subtitle1">{group.agencyName}</Typography>
              <Chip label={`${group.members.length} ${usersStrings.MEMBERS}`} color="primary" />
              <Chip label={`${group.reviews} ${usersStrings.REVIEWS_LABEL}`} color="secondary" />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {group.members.map((member) => (
                <ListItem key={member._id} divider>
                  <ListItemText
                    primary={member.fullName}
                    secondary={(
                      <Box>
                        <Typography variant="caption">{member.email}</Typography>
                        <Typography variant="caption" display="block">
                          {usersStrings.LAST_LOGIN}: {member.lastLoginAt ? formatDateTime(member.lastLoginAt) : usersStrings.UNKNOWN}
                        </Typography>
                      </Box>
                    )}
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={`${member.reviewsCount || 0} ${usersStrings.REVIEWS_LABEL}`} size="small" />
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => onViewReviews(member)}
                        disabled={!member.reviewsCount}
                      >
                        {usersStrings.VIEW_REVIEWS}
                      </Button>
                      {isAdmin && (
                        <Button
                          size="small"
                          variant={member.active ? 'outlined' : 'contained'}
                          onClick={() => onToggleActive(member, !member.active)}
                        >
                          {member.active ? usersStrings.DEACTIVATE : usersStrings.ACTIVATE}
                        </Button>
                      )}
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  )
}

export default React.memo(GroupByAgencyView)
