import React, { useCallback, useMemo, useState } from 'react'
import Seo from '@/components/Seo'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import Layout from '@/components/Layout'
import env from '@/config/env.config'
import * as helper from '@/common/helper'
import BookingList from '@/components/BookingList'
import SupplierFilter from '@/components/SupplierFilter'
import StatusFilter from '@/components/StatusFilter'
import BookingFilter from '@/components/BookingFilter'
import * as SupplierService from '@/services/SupplierService'
import { strings } from '@/lang/bookings'
import { computeSupplierState, shouldShowFilters } from './bookings.utils'

import '@/assets/css/bookings.css'

const Bookings = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [allSuppliers, setAllSuppliers] = useState<bookcarsTypes.User[]>([])
  const [suppliers, setSuppliers] = useState<string[]>()
  const [statuses, setStatuses] = useState(helper.getBookingStatuses().map((status) => status.value))
  const [filter, setFilter] = useState<bookcarsTypes.Filter | null>()
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [supplierError, setSupplierError] = useState<string | null>(null)

  const supplierState = useMemo(
    () => computeSupplierState(loadingSuppliers, Boolean(supplierError), allSuppliers),
    [loadingSuppliers, supplierError, allSuppliers]
  )
  const handleSupplierFilterChange = (_suppliers: string[]) => {
    setSuppliers(_suppliers)
  }

  const handleStatusFilterChange = (_statuses: bookcarsTypes.BookingStatus[]) => {
    setStatuses(_statuses)
  }

  const handleBookingFilterSubmit = (_filter: bookcarsTypes.Filter | null) => {
    setFilter(_filter)
  }

  const loadSuppliers = useCallback(async () => {
    setLoadingSuppliers(true)
    setSupplierError(null)

    try {
      const _allSuppliers = await SupplierService.getAllSuppliers()
      const _suppliers = bookcarsHelper.flattenSuppliers(_allSuppliers)
      setAllSuppliers(_allSuppliers)
      setSuppliers(_suppliers)
    } catch (error) {
      helper.error(error, 'Failed to fetch suppliers')
      setAllSuppliers([])
      setSuppliers([])
      setSupplierError(strings.SUPPLIERS_ERROR)
    } finally {
      setLoadingSuppliers(false)
    }
  }, [])

  const onLoad = async (_user?: bookcarsTypes.User) => {
    setUser(_user)
    await loadSuppliers()
  }

  return (
    <Layout onLoad={onLoad} strict>
      <Seo title="Mes réservations | Plany.tn" canonical="https://plany.tn/bookings" robots="noindex,nofollow" />
      {shouldShowFilters(user) && (
        <div className="bookings" aria-live="polite">
          <div className="col-1" aria-busy={loadingSuppliers}>
            <div>
              <SupplierFilter suppliers={allSuppliers} onChange={handleSupplierFilterChange} className="cl-supplier-filter" />
              <StatusFilter onChange={handleStatusFilterChange} className="cl-status-filter" />
              <BookingFilter onSubmit={handleBookingFilterSubmit} language={(user && user.language) || env.DEFAULT_LANGUAGE} className="cl-booking-filter" collapse={!env.isMobile()} />
            </div>
          </div>
          <div className="col-2" aria-busy={loadingSuppliers}>
            {supplierState !== 'ready' && (
              <div className="bookings__state" role="status">
                <div className="bookings__state-card">
                  <p className="bookings__state-title">
                    {supplierState === 'loading' && strings.SUPPLIERS_LOADING}
                    {supplierState === 'error' && supplierError}
                    {supplierState === 'empty' && strings.SUPPLIERS_EMPTY}
                  </p>
                  {supplierState === 'error' && (
                    <button type="button" className="bookings__retry" onClick={loadSuppliers}>
                      {strings.SUPPLIERS_RETRY}
                    </button>
                  )}
                </div>
              </div>
            )}
            <BookingList
              user={user}
              language={user.language}
              suppliers={suppliers}
              statuses={statuses}
              filter={filter}
              loading={loadingSuppliers}
              hideDates={env.isMobile()}
              checkboxSelection={false}
            />
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Bookings
