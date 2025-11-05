import { app, res } from '@/handler'
import { t, DurationsSchema } from '@schemas'
import type { Durations, DurationsByMode } from '~core/database'
import { randomInt } from '~core/helpers'

const resDTO = t.Object({
  durations: DurationsSchema,
})

const queryDTO = t.Object({
  addressIds: t.Optional(t.String()),
})

export const commuteDurationsEndpointHandler = app.get(
  '/durations',
  ({ query, res }) => {
    const addressIds = query.addressIds
      ? query.addressIds.split(',').filter(id => id.trim())
      : []

    // Generate mock commute times per address
    const durations: Durations = {}

    addressIds.forEach(addressId => {
      const addressDurations: DurationsByMode = {
        walking: randomInt(45, 90),
        biking: randomInt(25, 60),
        driving: randomInt(10, 30),
        transit: randomInt(10, 30),
      }
      durations[addressId] = addressDurations
    })

    return res.ok({
      durations,
    })
  },
  {
    query: queryDTO,
    response: res(resDTO),
  },
)
