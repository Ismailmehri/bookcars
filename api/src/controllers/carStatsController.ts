import { Request, Response } from 'express' // Import the correct types for Request and Response

import mongoose from 'mongoose'
import { CarStats } from 'src/models/CarStats'

export const getCarStats = async (req: Request, res: Response) => {
    try {
      const { supplierId, carId } = req.params
      const { start, end } = req.query

      const startDate = start ? new Date(start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const endDate = end ? new Date(end as string) : new Date()

      const match: any = {
        supplier: new mongoose.Types.ObjectId(supplierId),
        viewedAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }

      if (carId) {
        match.car = new mongoose.Types.ObjectId(carId)
      }

      const stats = await CarStats.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' } },
              car: '$car',
              supplier: '$supplier',
            },
            views: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'Car', // Nom de la collection MongoDB des voitures
            localField: '_id.car',
            foreignField: '_id',
            as: 'carDetails',
          },
        },
        { $unwind: '$carDetails' }, // Transforme l'array en objet unique
        {
            $lookup: {
              from: 'User', // Nom de la collection MongoDB des voitures
              localField: '_id.supplier',
              foreignField: '_id',
              as: 'suppDetails',
            },
          },
          { $unwind: '$suppDetails' }, // Transforme l'array en objet unique
        {
          $project: {
            date: '$_id.date',
            views: 1,
            // carStats: 1,
            carName: '$carDetails.name',
            carId: '$carDetails._id',
            supplierId: 'supplier',
            supplierName: '$suppDetails.fullName',
          },
        },
        { $sort: { '_id.date': 1 } },
      ])

      return res.json(stats)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Error fetching stats' })
    }
  }

export const getUniqueSuppliers = async (req: Request, res: Response) => {
    try {
        const suppliers = await CarStats.aggregate([
        {
            $lookup: {
            from: 'User', // Nom de la collection User
            localField: 'supplier',
            foreignField: '_id',
            as: 'supplierInfo',
            },
        },
        { $unwind: '$supplierInfo' }, // Déstructure l'objet récupéré
        {
            $group: {
            _id: '$supplierInfo._id',
            supplierName: { $first: '$supplierInfo.fullName' }, // Prend le premier nom trouvé
            },
        },
        {
            $project: {
            _id: 0,
            supplierId: '$_id', // Renomme _id en supplierId
            supplierName: 1,
            },
        },
        { $sort: { supplierName: 1 } }, // Trie les résultats par ordre alphabétique
        ])

        return res.json(suppliers)
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error fetching suppliers' })
    }
}
