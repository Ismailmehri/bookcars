import React, { useMemo, useState } from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Tooltip,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  SwapHoriz as ChangeRoleIcon,
} from '@mui/icons-material'
import * as bookcarsTypes from ':bookcars-types'
import { strings as commonStrings } from '@/lang/common'

interface UsersActionsCellProps {
  user: bookcarsTypes.User
  isAdmin: boolean
  canEdit: boolean
  canDelete: boolean
  onEdit: (user: bookcarsTypes.User) => void
  onDelete: (user: bookcarsTypes.User) => void
  onToggleActive: (user: bookcarsTypes.User, active: boolean) => void
  onChangeRole?: (user: bookcarsTypes.User, role: bookcarsTypes.UserType) => void
  availableRoles?: bookcarsTypes.UserType[]
}

const UsersActionsCell = ({
  user,
  isAdmin,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onToggleActive,
  onChangeRole,
  availableRoles = [],
}: UsersActionsCellProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const roleOptions = useMemo(() => (
    availableRoles.filter((role) => role !== user.type)
  ), [availableRoles, user.type])

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggleActive(user, event.target.checked)
  }

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleRoleChange = (role: bookcarsTypes.UserType) => {
    if (onChangeRole) {
      onChangeRole(user, role)
    }
    handleCloseMenu()
  }

  return (
    <>
      <Tooltip title={commonStrings.ACTIVE}>
        <Switch
          size="small"
          checked={Boolean(user.active)}
          color="success"
          onChange={handleToggle}
          inputProps={{ 'aria-label': commonStrings.ACTIVE }}
          disabled={!canEdit}
        />
      </Tooltip>
      {canEdit && (
        <Tooltip title={commonStrings.UPDATE}>
          <span>
            <IconButton
              color="primary"
              size="small"
              disabled={!canEdit}
              onClick={() => onEdit(user)}
              aria-label={commonStrings.UPDATE}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}
      {canDelete && (
        <Tooltip title={commonStrings.DELETE}>
          <span>
            <IconButton
              color="error"
              size="small"
              disabled={!canDelete}
              onClick={() => onDelete(user)}
              aria-label={commonStrings.DELETE}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}
      {isAdmin && roleOptions.length > 0 && (
        <>
          <Tooltip title={commonStrings.TYPE}>
            <IconButton
              size="small"
              onClick={handleOpenMenu}
              aria-haspopup="true"
              aria-controls={`user-${user._id}-role-menu`}
            >
              <MoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            id={`user-${user._id}-role-menu`}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            {roleOptions.map((role) => (
              <MenuItem key={role} onClick={() => handleRoleChange(role)}>
                <ListItemIcon>
                  <ChangeRoleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{role}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </>
  )
}

export default React.memo(UsersActionsCell)
