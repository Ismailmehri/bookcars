import React, { useEffect, useState } from 'react'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import {
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Edit as EditIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'
import * as bookcarsTypes from ':bookcars-types'
import env from '@/config/env.config'
import * as helper from '@/common/helper'
import * as bookcarsHelper from ':bookcars-helper'
import * as SubscriptionService from '@/services/SubscriptionService'

import '@/assets/css/subscription-list.css'

interface SubscriptionListProps {
  onLoad?: bookcarsTypes.DataEvent<bookcarsTypes.Subscription>
}

const SubscriptionList = ({ onLoad }: SubscriptionListProps) => {
  const [page, setPage] = useState(0)
  const [pageSize] = useState(env.PAGE_SIZE)
  const [rows, setRows] = useState<bookcarsTypes.Subscription[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: env.PAGE_SIZE,
    page: 0,
  })

  useEffect(() => {
    setPage(paginationModel.page)
  }, [paginationModel])

  const fetchData = async (_page: number) => {
    try {
      setLoading(true)
      const _data = await SubscriptionService.getSubscriptions(_page + 1, pageSize)
      const total = Array.isArray(_data.pageInfo) && _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0
      setRows(_data.resultData)
      setRowCount(total)
      if (onLoad) {
        onLoad({ rows: _data.resultData, rowCount: total })
      }
    } catch (err) {
      helper.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(page)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const columns: GridColDef<bookcarsTypes.Subscription>[] = [
    {
      field: 'supplier',
      headerName: 'Agence',
      flex: 1,
      valueGetter: (params) => ((params as bookcarsTypes.User)?.fullName ?? ''),
    },
    { field: 'plan', headerName: 'Plan', width: 100 },
    { field: 'period', headerName: 'Période', width: 100 },
    { field: 'resultsCars', headerName: 'Voitures', width: 100 },
    { field: 'sponsoredCars', headerName: 'Sponsorisées', width: 130 },
    {
      field: 'startDate',
      headerName: 'Début',
      width: 110,
      valueGetter: (params) => new Date(params as string).toLocaleDateString(),
    },
    {
      field: 'endDate',
      headerName: 'Fin',
      width: 110,
      valueGetter: (params) => new Date(params as string).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 120,
      renderCell: ({ row }) => (
        <>
          <Tooltip title="Modifier">
            <IconButton href={`/update-subscription?id=${row._id}`} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          {row.invoice && (
            <Tooltip title="Télécharger la facture">
              <IconButton
                href={bookcarsHelper.joinURL(env.CDN_INVOICES, row.invoice)}
                target="_blank"
                size="small"
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      ),
    },
  ]

  return (
    <div className="sub-list">
      <DataGrid
        getRowId={(row) => row._id as string}
        columns={columns}
        rows={rows}
        rowCount={rowCount}
        loading={loading}
        initialState={{ pagination: { paginationModel: { pageSize } } }}
        pageSizeOptions={[pageSize]}
        pagination
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />
    </div>
  )
}

export default SubscriptionList
