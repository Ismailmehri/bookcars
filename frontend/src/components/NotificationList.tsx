import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  Tooltip,
  Typography
} from '@mui/material'
import {
  Visibility as ViewIcon,
  Drafts as MarkReadIcon,
  Markunread as MarkUnreadIcon,
  Delete as DeleteIcon,
  ArrowBackIos as PreviousPageIcon,
  ArrowForwardIos as NextPageIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/notifications'
import * as NotificationService from '@/services/NotificationService'
import * as helper from '@/common/helper'
import env from '@/config/env.config'
import Backdrop from '@/components/SimpleBackdrop'
import { useGlobalContext, GlobalContextType } from '@/context/GlobalContext'
import { buildRangeLabel, getNotificationsState } from './notification-list.utils'

import '@/assets/css/notification-list.css'

interface NotificationListProps {
  user?: bookcarsTypes.User
}

const NotificationList = ({ user }: NotificationListProps) => {
  const navigate = useNavigate()
  const { setNotificationCount } = useGlobalContext() as GlobalContextType

  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<bookcarsTypes.Notification[]>([])
  const [rowCount, setRowCount] = useState(-1)
  const [totalRecords, setTotalRecords] = useState(-1)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedRows, setSelectedRows] = useState<bookcarsTypes.Notification[]>([])
  const [hasError, setHasError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const notificationsListRef = useRef<HTMLDivElement>(null)

  const _fr = user && user.language === 'fr'
  const _locale = _fr ? fr : enUS
  const _format = _fr ? 'eee d LLLL, kk:mm' : 'eee, d LLLL, kk:mm'

  const fetch = useCallback(async () => {
    if (user && user._id) {
      try {
        setLoading(true)
        setHasError(false)
        const data = await NotificationService.getNotifications(user._id, page)
        const _data = data && data.length > 0 ? data[0] : { pageInfo: { totalRecord: 0 }, resultData: [] }
        if (!_data) {
          helper.error()
          return
        }
        const _rows = _data.resultData.map((row) => ({
          checked: false,
          ...row,
        }))
        const _totalRecords = Array.isArray(_data.pageInfo) && _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0
        setTotalRecords(_totalRecords)
        setRowCount((page - 1) * env.PAGE_SIZE + _rows.length)
        setRows(_rows)
        if (notificationsListRef.current) {
          notificationsListRef.current.scrollTo(0, 0)
        }
      } catch (err) {
        setHasError(true)
        helper.error(err)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    } else {
      setLoading(false)
    }
  }, [user, page])

  useEffect(() => {
    fetch()
  }, [fetch])

  const checkedRows = rows.filter((row) => row.checked)
  const allChecked = rows.length > 0 && checkedRows.length === rows.length
  const indeterminate = checkedRows.length > 0 && checkedRows.length < rows.length
  const state = getNotificationsState(loading, totalRecords, hasError)

  return (
    <>
      <div className="notifications">
        {state === 'loading' && (
          <Card variant="outlined" className="notification-state">
            <CardContent className="notification-state-content">
              <CircularProgress size={28} aria-label={strings.LOADING} />
              <Typography component="p" color="textSecondary">
                {strings.LOADING}
              </Typography>
            </CardContent>
          </Card>
        )}

        {state === 'error' && (
          <Card variant="outlined" className="notification-state error">
            <CardContent className="notification-state-content">
              <Typography component="p" color="error">
                {strings.FETCH_ERROR}
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setRefreshing(true)
                  fetch()
                }}
                className="btn-primary"
              >
                {strings.RETRY}
              </Button>
            </CardContent>
          </Card>
        )}

        {state === 'empty' && (
          <Card variant="outlined" className="empty-list">
            <CardContent>
              <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
              <Button
                variant="outlined"
                size="small"
                className="btn-secondary"
                onClick={() => {
                  setRefreshing(true)
                  fetch()
                }}
              >
                {strings.REFRESH}
              </Button>
            </CardContent>
          </Card>
        )}

        {state === 'ready' && (
          <>
            <div className="header-container">
              <div className="header" aria-live="polite">
                <div className="header-checkbox">
                  <Checkbox
                    checked={allChecked}
                    indeterminate={indeterminate}
                    onChange={(event) => {
                      if (indeterminate) {
                        for (const row of rows) {
                          row.checked = false
                        }
                      } else {
                        for (const row of rows) {
                          row.checked = event.target.checked
                        }
                      }
                      setRows(bookcarsHelper.clone(rows))
                    }}
                    inputProps={{ 'aria-label': 'toggle all notifications' }}
                  />
                </div>
                {checkedRows.length > 0 && (
                  <div className="header-actions">
                    {checkedRows.some((row) => !row.isRead) && (
                      <Tooltip title={strings.MARK_ALL_AS_READ}>
                        <IconButton
                          onClick={async () => {
                            try {
                              if (!user || !user._id) {
                                helper.error()
                                return
                              }
                              const _rows = checkedRows.filter((row) => !row.isRead)
                              const ids = _rows.map((row) => row._id)
                              const status = await NotificationService.markAsRead(user._id, ids)

                              if (status === 200) {
                                for (const row of rows) {
                                  row.isRead = true
                                }
                                setRows(bookcarsHelper.clone(rows))
                                setNotificationCount((prev) => prev - _rows.length)
                              } else {
                                helper.error()
                              }
                            } catch (err) {
                              helper.error(err)
                            }
                          }}
                        >
                          <MarkReadIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {checkedRows.some((row) => row.isRead) && (
                      <Tooltip title={strings.MARK_ALL_AS_UNREAD}>
                        <IconButton
                          onClick={async () => {
                            try {
                              if (!user || !user._id) {
                                helper.error()
                                return
                              }
                              const _rows = checkedRows.filter((row) => row.isRead)
                              const ids = _rows.map((row) => row._id)
                              const status = await NotificationService.markAsUnread(user._id, ids)

                              if (status === 200) {
                                for (const row of rows) {
                                  row.isRead = false
                                }
                                setRows(bookcarsHelper.clone(rows))
                                setNotificationCount((prev) => prev + _rows.length)
                              } else {
                                helper.error()
                              }
                            } catch (err) {
                              helper.error(err)
                            }
                          }}
                        >
                          <MarkUnreadIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={strings.DELETE_ALL}>
                      <IconButton
                        onClick={() => {
                          setSelectedRows(checkedRows)
                          setOpenDeleteDialog(true)
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={strings.REFRESH}>
                      <IconButton
                        disabled={refreshing}
                        onClick={() => {
                          setRefreshing(true)
                          fetch()
                        }}
                      >
                        <CircularProgress size={20} className={`refresh-spinner${refreshing ? ' spinning' : ''}`} />
                      </IconButton>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
            <div ref={notificationsListRef} className="notifications-list">
              {rows.map((row) => (
                <div key={row._id} className="notification-container">
                  <div className="notification-checkbox">
                    <Checkbox
                      checked={row.checked}
                      onChange={(event) => {
                        row.checked = event.target.checked
                        setRows(bookcarsHelper.clone(rows))
                      }}
                      inputProps={{ 'aria-label': strings.VIEW }}
                    />
                  </div>
                  <div className={`notification${!row.isRead ? ' unread' : ''}`}>
                    <div className="date">
                      {row.createdAt && bookcarsHelper.capitalize(
                        format(new Date(row.createdAt), _format, {
                          locale: _locale,
                        }),
                      )}
                    </div>
                    <div className="message-container">
                      <div className="message">{row.message}</div>
                      <div className="actions">
                        {row.booking && (
                          <Tooltip title={strings.VIEW}>
                            <IconButton
                              onClick={async () => {
                                try {
                                  if (!user || !user._id) {
                                    helper.error()
                                    return
                                  }

                                  const __navigate__ = () => {
                                    navigate(`/booking?b=${row.booking}`)
                                  }

                                  if (!row.isRead) {
                                    const status = await NotificationService.markAsRead(user._id, [row._id])

                                    if (status === 200) {
                                      row.isRead = true
                                      setRows(bookcarsHelper.clone(rows))
                                      setNotificationCount((prev) => prev - 1)
                                      __navigate__()
                                    } else {
                                      helper.error()
                                    }
                                  } else {
                                    __navigate__()
                                  }
                                } catch (err) {
                                  helper.error(err)
                                }
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {!row.isRead ? (
                          <Tooltip title={strings.MARK_AS_READ}>
                            <IconButton
                              onClick={async () => {
                                try {
                                  if (!user || !user._id) {
                                    helper.error()
                                    return
                                  }

                                  const status = await NotificationService.markAsRead(user._id, [row._id])

                                  if (status === 200) {
                                    row.isRead = true
                                    setRows(bookcarsHelper.clone(rows))
                                    setNotificationCount((prev) => prev - 1)
                                  } else {
                                    helper.error()
                                  }
                                } catch (err) {
                                  helper.error(err)
                                }
                              }}
                            >
                              <MarkReadIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title={strings.MARK_AS_UNREAD}>
                            <IconButton
                              onClick={async () => {
                                try {
                                  if (!user || !user._id) {
                                    helper.error()
                                    return
                                  }

                                  const status = await NotificationService.markAsUnread(user._id, [row._id])

                                  if (status === 200) {
                                    row.isRead = false
                                    setRows(bookcarsHelper.clone(rows))
                                    setNotificationCount((prev) => prev + 1)
                                  } else {
                                    helper.error()
                                  }
                                } catch (err) {
                                  helper.error(err)
                                }
                              }}
                            >
                              <MarkUnreadIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title={commonStrings.DELETE}>
                          <IconButton
                            onClick={() => {
                              setSelectedRows([row])
                              setOpenDeleteDialog(true)
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="notifications-footer">
              {rowCount > -1 && (
                <div className="row-count">
                  {`${buildRangeLabel(page, totalRecords, env.PAGE_SIZE, rows.length)} ${commonStrings.OF} ${totalRecords}`}
                </div>
              )}

              <div className="actions">
                <IconButton
                  disabled={page === 1}
                  onClick={() => {
                    const _page = page - 1
                    setRowCount(_page < Math.ceil(totalRecords / env.PAGE_SIZE) ? (_page - 1) * env.PAGE_SIZE + env.PAGE_SIZE : totalRecords)
                    setPage(_page)
                  }}
                >
                  <PreviousPageIcon className="icon" />
                </IconButton>
                <IconButton
                  disabled={(page - 1) * env.PAGE_SIZE + rows.length >= totalRecords}
                  onClick={() => {
                    const _page = page + 1
                    setRowCount(_page < Math.ceil(totalRecords / env.PAGE_SIZE) ? (_page - 1) * env.PAGE_SIZE + env.PAGE_SIZE : totalRecords)
                    setPage(_page)
                  }}
                >
                  <NextPageIcon className="icon" />
                </IconButton>
              </div>
            </div>

            <Dialog disableEscapeKeyDown maxWidth="xs" open={openDeleteDialog}>
              <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
              <DialogContent>{selectedRows.length > 1 ? strings.DELETE_NOTIFICATIONS : strings.DELETE_NOTIFICATION}</DialogContent>
              <DialogActions className="dialog-actions">
                <Button
                  onClick={() => {
                    setOpenDeleteDialog(false)
                  }}
                  variant="contained"
                  className="btn-secondary"
                >
                  {commonStrings.CANCEL}
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      if (!user || !user._id) {
                        helper.error()
                        return
                      }

                      const ids = selectedRows.map((row) => row._id)
                      const status = await NotificationService.deleteNotifications(user._id, ids)

                      if (status === 200) {
                        if (selectedRows.length === rows.length) {
                          const _page = 1
                          const _totalRecords = totalRecords - selectedRows.length
                          setRowCount(_page < Math.ceil(_totalRecords / env.PAGE_SIZE) ? (_page - 1) * env.PAGE_SIZE + env.PAGE_SIZE : _totalRecords)

                          if (page > 1) {
                            setPage(1)
                          } else {
                            fetch()
                          }
                        } else {
                          selectedRows.forEach((row) => {
                            rows.splice(
                              rows.findIndex((_row) => _row._id === row._id),
                              1,
                            )
                          })
                          setRows(bookcarsHelper.clone(rows))
                          setRowCount(rowCount - selectedRows.length)
                          setTotalRecords(totalRecords - selectedRows.length)
                        }
                        setNotificationCount((prev) => prev - selectedRows.length)
                        setOpenDeleteDialog(false)
                      } else {
                        helper.error()
                      }
                    } catch (err) {
                      helper.error(err)
                    }
                  }}
                  variant="contained"
                  color="error"
                >
                  {commonStrings.DELETE}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </div>
      {loading && <Backdrop text={commonStrings.LOADING} />}
    </>
  )
}

export default NotificationList
