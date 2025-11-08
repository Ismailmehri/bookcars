import React from 'react'
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/users'

interface BulkActionRecipientsProps {
  users: bookcarsTypes.User[]
}

const BulkActionRecipients: React.FC<BulkActionRecipientsProps> = ({ users }) => {
  if (users.length === 0) {
    return null
  }

  const getDisplayName = (user: bookcarsTypes.User) => {
    if (user.fullName) {
      return user.fullName
    }

    if (user.email) {
      return user.email
    }

    if (user.phone) {
      return user.phone
    }

    return strings.ANONYMOUS_USER
  }

  return (
    <Box sx={{ maxHeight: 180, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {strings.BULK_DIALOG_RECIPIENTS.replace('{count}', users.length.toString())}
      </Typography>
      <List dense disablePadding>
        {users.map((user) => (
          <ListItem key={user._id as string} disableGutters sx={{ py: 0.5 }}>
            <ListItemText primary={getDisplayName(user)} primaryTypographyProps={{ variant: 'body2' }} />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default BulkActionRecipients
