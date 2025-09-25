import React, { useCallback, useMemo, useState } from 'react'
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Checkbox,
  ListItemText,
} from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import { strings } from '@/lang/commissions'
import * as helper from '@/common/helper'
import * as SupplierService from '@/services/SupplierService'
import * as CommissionService from '@/services/CommissionService'
import env from '@/config/env.config'

import '@/assets/css/commissions.css'

const formatDate = (value?: Date | string, language?: string) => {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const locale = language === 'en' ? 'en-US' : 'fr-FR'
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatDateTime = (value?: Date | string | null, language?: string) => {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const locale = language === 'en' ? 'en-US' : 'fr-FR'
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const AgencyCommissions = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [admin, setAdmin] = useState(false)
  const [suppliers, setSuppliers] = useState<bookcarsTypes.User[]>([])
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [summary, setSummary] = useState<bookcarsTypes.CommissionSummary>()
  const [rows, setRows] = useState<bookcarsTypes.CommissionBooking[]>([])
  const [fetching, setFetching] = useState(false)
  const [reminderLoading, setReminderLoading] = useState<Record<string, boolean>>({})

  const language = user?.language || env.DEFAULT_LANGUAGE

  const loadCommissions = useCallback(async (supplierIds?: string[]) => {
    setFetching(true)
    try {
      const payload: bookcarsTypes.AgencyCommissionsPayload = {
        supplierIds,
      }
      const data = await CommissionService.getAgencyCommissions(payload)
      setSummary(data.summary)
      setRows(data.bookings)
    } catch (err) {
      helper.error(err)
    } finally {
      setFetching(false)
    }
  }, [])

  const loadSuppliers = useCallback(async () => {
    try {
      const list = await SupplierService.getAllSuppliers()
      setSuppliers(list)
    } catch (err) {
      helper.error(err)
    }
  }, [])

  const onLoad = async (_user?: bookcarsTypes.User) => {
    if (_user) {
      setUser(_user)
      const isAdmin = helper.admin(_user)
      setAdmin(isAdmin)

      if (isAdmin) {
        await loadSuppliers()
        await loadCommissions()
      } else if (_user._id) {
        await loadCommissions([_user._id])
      }
    }
  }

  const handleSupplierChange = async (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target
    const selectedRaw = typeof value === 'string' ? value.split(',') : value
    const selected = selectedRaw.filter((id) => id && id !== '')
    setSelectedSuppliers(selected)
    await loadCommissions(selected.length > 0 ? selected : undefined)
  }

  const handleReminder = async (bookingId: string, type: 'supplier' | 'client') => {
    setReminderLoading((prev) => ({ ...prev, [bookingId]: true }))
    try {
      const updated = type === 'supplier'
        ? await CommissionService.remindSupplier(bookingId)
        : await CommissionService.remindClient(bookingId)

      setRows((prev) => prev.map((row) => (row.bookingId === bookingId ? updated : row)))
      helper.info(strings.REMIND_SUCCESS)
    } catch (err) {
      helper.error(err)
    } finally {
      setReminderLoading((prev) => ({ ...prev, [bookingId]: false }))
    }
  }

  const summaryCards = useMemo(() => ([
    {
      title: strings.SUMMARY_BOOKINGS,
      value: summary?.bookings ? summary.bookings.toLocaleString(language === 'en' ? 'en-US' : 'fr-FR') : '0',
    },
    {
      title: strings.SUMMARY_TOTAL,
      value: helper.formatNumber(summary?.totalAmount || 0),
    },
    {
      title: strings.SUMMARY_COMMISSION,
      value: helper.formatNumber(summary?.totalCommission || 0),
    },
    {
      title: strings.SUMMARY_PAID,
      value: helper.formatNumber(summary?.paidCommission || 0),
    },
    {
      title: strings.SUMMARY_PENDING,
      value: helper.formatNumber(summary?.pendingCommission || 0),
    },
  ]), [summary])

  return (
    <Layout onLoad={onLoad} strict>
      <div className="commissions">
        <div className="commission-controls">
          <h1>{strings.TITLE}</h1>
          {fetching && <CircularProgress size={24} />}
        </div>

        {admin && suppliers.length > 0 && (
          <FormControl sx={{ minWidth: 260 }} size="small">
            <InputLabel id="commission-supplier-label">{strings.SUPPLIER_FILTER_LABEL}</InputLabel>
            <Select
              labelId="commission-supplier-label"
              multiple
              value={selectedSuppliers}
              onChange={handleSupplierChange}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return strings.ALL_AGENCIES
                }

                return suppliers
                  .filter((supplier) => supplier._id && selected.includes(supplier._id))
                  .map((supplier) => supplier.fullName)
                  .join(', ')
              }}
              label={strings.SUPPLIER_FILTER_LABEL}
              displayEmpty
            >
              <MenuItem disabled value="">
                <em>{strings.ALL_AGENCIES}</em>
              </MenuItem>
              {suppliers.filter((supplier) => supplier._id).map((supplier) => (
                <MenuItem key={supplier._id} value={supplier._id as string}>
                  <Checkbox checked={selectedSuppliers.indexOf(supplier._id as string) > -1} />
                  <ListItemText primary={supplier.fullName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <div className="commission-summary">
          {summaryCards.map((card) => (
            <div className="commission-card" key={card.title}>
              <span className="commission-card-title">{card.title}</span>
              <span className="commission-card-value">{card.value}</span>
            </div>
          ))}
        </div>

        <div className="commission-table-wrapper">
          {rows.length === 0 && !fetching ? (
            <div className="commission-empty">{strings.NO_DATA}</div>
          ) : (
            <table className="commission-table">
              <thead>
                <tr>
                  <th>{strings.BOOKING_ID}</th>
                  <th>{strings.SUPPLIER}</th>
                  <th>{strings.CLIENT}</th>
                  <th>{strings.PERIOD}</th>
                  <th>{strings.STATUS}</th>
                  <th>{strings.PRICE}</th>
                  <th>{strings.COMMISSION}</th>
                  <th>{strings.REMINDER_COUNT}</th>
                  <th>{strings.LAST_REMINDER}</th>
                  <th>{strings.ACTIONS}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const supplierReminder = row.notifications?.supplier
                  const clientReminder = row.notifications?.client
                  const reminderCount = [supplierReminder?.count || 0, clientReminder?.count || 0]
                    .reduce((acc, value) => acc + value, 0)
                  const reminderDates = [supplierReminder?.lastSent, clientReminder?.lastSent]
                    .filter((value): value is string | Date => !!value)
                    .map((value) => (value instanceof Date ? value.getTime() : new Date(value).getTime()))
                    .filter((timestamp) => !Number.isNaN(timestamp))
                  const latestReminder = reminderDates.length > 0
                    ? new Date(Math.max(...reminderDates))
                    : null

                  return (
                    <tr key={row.bookingId}>
                      <td>{row.bookingId}</td>
                      <td>{row.supplier.fullName}</td>
                      <td>{row.driver.fullName}</td>
                      <td>
                        {`${formatDate(row.from, language)} – ${formatDate(row.to, language)}`}
                      </td>
                      <td>{helper.getBookingStatus(row.status)}</td>
                      <td>{helper.formatNumber(row.price)}</td>
                      <td>{helper.formatNumber(row.commission)}</td>
                      <td>{reminderCount}</td>
                      <td>{formatDateTime(latestReminder, language) || '-'}</td>
                      <td>
                        <div className="commission-row-actions">
                          <Button
                            variant="outlined"
                            size="small"
                            href={`/update-booking?b=${row.bookingId}`}
                          >
                            {strings.VIEW_BOOKING}
                          </Button>
                          {row.supplier._id && (
                            <Button
                              variant="outlined"
                              size="small"
                              href={`/update-supplier?c=${row.supplier._id}`}
                            >
                              {strings.VIEW_SUPPLIER}
                            </Button>
                          )}
                          {row.driver._id && (
                            <Button
                              variant="outlined"
                              size="small"
                              href={`/update-user?u=${row.driver._id}`}
                            >
                              {strings.VIEW_CLIENT}
                            </Button>
                          )}
                          <Button
                            variant="contained"
                            size="small"
                            disabled={!!reminderLoading[row.bookingId]}
                            onClick={() => handleReminder(row.bookingId, 'supplier')}
                          >
                            {reminderLoading[row.bookingId] ? <CircularProgress size={16} /> : strings.REMIND_SUPPLIER}
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            disabled={!!reminderLoading[row.bookingId]}
                            onClick={() => handleReminder(row.bookingId, 'client')}
                          >
                            {reminderLoading[row.bookingId] ? <CircularProgress size={16} /> : strings.REMIND_CLIENT}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default AgencyCommissions
