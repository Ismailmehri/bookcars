import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import AgencyCommissionEvent from '../src/models/AgencyCommissionEvent'
import AgencyCommissionSettings from '../src/models/AgencyCommissionSettings'
import AgencyCommissionState from '../src/models/AgencyCommissionState'

describe('AgencyCommissionSettings model', () => {
  it('should provide default reminder channel and templates', () => {
    const settings = new AgencyCommissionSettings()

    expect(settings.reminderChannel).toBe(bookcarsTypes.CommissionReminderChannel.Email)
    expect(settings.emailTemplate).toContain('{{amount}}')
    expect(settings.smsTemplate).toContain('{{amount}}')
  })

  it('should reject unsupported reminder channels', () => {
    const settings = new AgencyCommissionSettings({
      reminderChannel: 'invalid-channel' as bookcarsTypes.CommissionReminderChannel,
    })

    const validationError = settings.validateSync()

    expect(validationError?.errors.reminderChannel).toBeDefined()
  })

  it('should reference users in the updatedBy field', () => {
    const updatedByPath = AgencyCommissionSettings.schema.path('updatedBy')

    expect(updatedByPath?.options.ref).toBe('User')
  })
})

describe('AgencyCommissionState model', () => {
  it('should require an agency identifier', () => {
    const state = new AgencyCommissionState()

    const validationError = state.validateSync()

    expect(validationError?.errors.agency).toBeDefined()
  })

  it('should default blocked flag to false', () => {
    const state = new AgencyCommissionState({
      agency: new mongoose.Types.ObjectId(),
    })

    expect(state.blocked).toBe(false)
  })

  it('should allow storing disabled cars as object ids', () => {
    const carId = new mongoose.Types.ObjectId()
    const state = new AgencyCommissionState({
      agency: new mongoose.Types.ObjectId(),
      disabledCars: [carId],
    })

    const validationError = state.validateSync()

    expect(validationError).toBeUndefined()
    expect(state.disabledCars).toEqual([carId])
  })
})

describe('AgencyCommissionEvent model', () => {
  it('should enforce mandatory event fields', () => {
    const event = new AgencyCommissionEvent()

    const validationError = event.validateSync()

    expect(validationError?.errors.agency).toBeDefined()
    expect(validationError?.errors.month).toBeDefined()
    expect(validationError?.errors.year).toBeDefined()
    expect(validationError?.errors.type).toBeDefined()
    expect(validationError?.errors.admin).toBeDefined()
  })

  it('should default the amount to zero when omitted', () => {
    const event = new AgencyCommissionEvent({
      agency: new mongoose.Types.ObjectId(),
      month: 5,
      year: 2024,
      type: bookcarsTypes.AgencyCommissionEventType.Payment,
      admin: new mongoose.Types.ObjectId(),
    })

    expect(event.amount).toBe(0)
    const validationError = event.validateSync()
    expect(validationError).toBeUndefined()
  })

  it('should expose a compound index to prevent duplicate events', () => {
    const indexes = AgencyCommissionEvent.schema.indexes()

    const hasCompoundIndex = indexes.some(([fields]) => (
      fields.agency === 1
      && fields.month === 1
      && fields.year === 1
      && fields.type === 1
    ))

    expect(hasCompoundIndex).toBe(true)
  })
})
