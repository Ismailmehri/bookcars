import { nanoid } from 'nanoid'
import * as bookcarsTypes from ':bookcars-types'
import * as mailHelper from '../src/common/mailHelper'
import AdditionalDriver from '../src/models/AdditionalDriver'
import User from '../src/models/User'

test('AdditionalDriver phone validation fails', () => {
  const additionalDriver: bookcarsTypes.AdditionalDriver = {
    email: `${nanoid()}@test.bookcars.ma`,
    fullName: 'Additional Driver 1',
    birthDate: new Date(1990, 5, 20),
    phone: '',
  }
  const doc = new AdditionalDriver(additionalDriver)
  const err = doc.validateSync()
  expect(err).toBeDefined()
})

test('User phone validation fails', () => {
  const user: bookcarsTypes.User = {
    email: `${nanoid()}@test.bookcars.ma`,
    fullName: 'User 1',
    birthDate: new Date(1990, 5, 20),
    phone: '',
  }
  const doc = new User(user)
  doc.phone = 'unknown'
  const err = doc.validateSync()
  expect(err).toBeDefined()
})

test('sendMail rejects invalid email', async () => {
  await expect(mailHelper.sendMail({
    from: `${nanoid()}@test.bookcars.ma`,
    to: 'wrong-email',
    subject: 'dummy subject',
    html: 'dummy body',
  })).rejects.toBeDefined()
})
