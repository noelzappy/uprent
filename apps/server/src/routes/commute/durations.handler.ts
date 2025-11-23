import { app, res } from '@/handler'
import { t, DurationsSchema } from '@schemas'
import { DefaultMaxDurations } from '~core/constants/commute-constants'
import type { Durations, DurationsByMode } from '~core/database'
import { randomInt } from '~core/helpers'
import { Address, UserPreferences } from '~core/types'

const resDTO = t.Object({
  durations: DurationsSchema,
})

const queryDTO = t.Object({
  userSessionId: t.String(),
})

export const commuteDurationsEndpointHandler = app.get(
  '/durations',
  ({ query, res, db }) => {
    const { userSessionId } = query
    if (!userSessionId) {
      return res.badRequest('User session ID is required')
    }

    let result = db
      .query(
        `SELECT * FROM user_preferences WHERE userSessionId = $userSessionId`,
      )
      .get({ $userSessionId: userSessionId }) as UserPreferences | null

    if (!result) {
      result = {
        favoriteAddresses: '[]',
        ...DefaultMaxDurations,
      }
    }
    const preferences = {
      addresses: JSON.parse(result.favoriteAddresses) || [],
      maxDurations: {
        walking: result.walking,
        biking: result.biking,
        driving: result.driving,
        transit: result.transit,
      },
    }

    const durations: Durations = {}
    const addresses: Address[] = preferences.addresses || []

    addresses.forEach(({ id: addressId, label }) => {
      const addressDurations: DurationsByMode = {
        walking: randomInt(45, 90),
        biking: randomInt(25, 60),
        driving: randomInt(10, 30),
        transit: randomInt(10, 30),
        addressLabel: label,
        id: addressId,
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
