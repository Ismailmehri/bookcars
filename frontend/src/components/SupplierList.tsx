import React, { useEffect, useState } from 'react'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import * as SupplierService from '@/services/SupplierService'

import '@/assets/css/supplier-list.css'

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState<bookcarsTypes.User[]>([])

  useEffect(() => {
    const fetch = async () => {
      try {
        // Récupérer tous les fournisseurs avec le nombre de voitures (carCount)
        const _suppliers = await SupplierService.getAllSuppliers()

        // Filtrer les fournisseurs avec au moins une voiture (carCount > 0)
        const suppliersWithCars = _suppliers.filter((supplier) => supplier.carCount && supplier.carCount > 0 && supplier.active && supplier.verified)

        // Trier les fournisseurs par nombre de voitures (carCount) en ordre décroissant
        suppliersWithCars.sort((a, b) => (b.carCount || 0) - (a.carCount || 0))

        // Mettre à jour l'état avec les fournisseurs filtrés et triés
        setSuppliers(suppliersWithCars)
      } catch (err) {
        console.error(err)
      }
    }

    fetch()
  }, [])

  return (
    <div className="supplier-list">
      {suppliers.map((supplier) => (
        <div key={supplier._id} className="supplier" title={supplier.fullName}>
          <div className="img">
            <img src={bookcarsHelper.joinURL(env.CDN_USERS, supplier.avatar)} alt={supplier.fullName} />
          </div>
          <div className="name">
            {supplier.fullName}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SupplierList
