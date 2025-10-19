import React from 'react'
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/insights'

interface BulkActionRecipientsProps {
  agencies: bookcarsTypes.AgencyRankingItem[]
}

const BulkActionRecipients: React.FC<BulkActionRecipientsProps> = ({ agencies }) => {
  if (agencies.length === 0) {
    return null
  }

  return (
    <Box sx={{ maxHeight: 180, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {strings.BULK_DIALOG_RECIPIENTS.replace('{count}', agencies.length.toString())}
      </Typography>
      <List dense disablePadding>
        {agencies.map((agency) => (
          <ListItem key={agency.agencyId} disableGutters sx={{ py: 0.5 }}>
            <ListItemText
              primary={agency.agencyName}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default BulkActionRecipients
