import { Request, Response } from 'express' // Import the correct types for Request and Response

import mongoose from 'mongoose'
import Booking from '../models/Booking'
import { CarStats } from '../models/CarStats'
import { BookingStatus } from ':bookcars-types'
import User from '../models/User'

export const getCarStats = async (req: Request, res: Response) => {
    try {
      const { supplierId, carId } = req.params
      const { start, end } = req.query

      const startDate = start ? new Date(start as string) : new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
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
            payedViews: {
              $sum: {
                $cond: [{ $eq: ['$paidView', true] }, 1, 0],
              },
            },
            organiqueViews: {
              $sum: {
                $cond: [{ $eq: ['$paidView', false] }, 1, 0],
              },
            },
          },
        },
        {
          $lookup: {
            from: 'Car',
            localField: '_id.car',
            foreignField: '_id',
            as: 'carDetails',
          },
        },
        { $unwind: '$carDetails' },
        {
          $lookup: {
            from: 'User',
            localField: '_id.supplier',
            foreignField: '_id',
            as: 'suppDetails',
          },
        },
        { $unwind: '$suppDetails' },
        {
          $project: {
            date: '$_id.date',
            views: 1,
            payedViews: 1,
            organiqueViews: 1,
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

export const getBookingStats = async (req: Request, res: Response) => {
    const { supplierId, carId } = req.params
    const { start, end } = req.query

    const startDate = start ? new Date(start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = end ? new Date(end as string) : new Date()

    const match: any = {
        supplier: new mongoose.Types.ObjectId(supplierId),
        createdAt: { $gte: startDate, $lte: endDate },
      }

    if (carId) {
        match.car = new mongoose.Types.ObjectId(carId)
      }

  const stats = await Booking.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPrice: { $sum: '$price' },
      },
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        totalPrice: 1,
        _id: 0,
      },
    },
  ])

  res.status(200).json(stats)
}

export const getBookingSummary = async (req: Request, res: Response) => {
    try {
      const { supplierId, carId } = req.params

      const match: any = {
        supplier: new mongoose.Types.ObjectId(supplierId),
        status: {
          $in: [
            BookingStatus.Paid,
            BookingStatus.Deposit,
            BookingStatus.Reserved,
          ],
        },
      }

      if (carId) {
        match.car = new mongoose.Types.ObjectId(carId)
      }

      const stats = await Booking.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: '$price' },
            paid: {
              $sum: {
                $cond: [{ $eq: ['$status', BookingStatus.Paid] }, '$price', 0],
              },
            },
            deposit: {
              $sum: {
                $cond: [{ $eq: ['$status', BookingStatus.Deposit] }, '$price', 0],
              },
            },
            reserved: {
              $sum: {
                $cond: [{ $eq: ['$status', BookingStatus.Reserved] }, '$price', 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            paid: 1,
            deposit: 1,
            reserved: 1,
          },
        },
      ])

      res.status(200).json(stats[0] || { total: 0, paid: 0, deposit: 0, reserved: 0 })
    } catch (err) {
      res.status(500).send(err)
    }
  }

  export const getUniqueSuppliers = async (req: Request, res: Response) => {
    try {
      const supplierIds = await CarStats.distinct('supplier')

      const suppliers = await User.find(
        { _id: { $in: supplierIds } },
        { _id: 1, fullName: 1 },
      ).sort({ fullName: 1 })

      const result = suppliers.map((s) => ({
        supplierId: s._id,
        supplierName: s.fullName,
      }))

      return res.json(result)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Error fetching suppliers' })
    }
  }
