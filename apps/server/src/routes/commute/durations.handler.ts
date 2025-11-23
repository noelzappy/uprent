import { app, res } from '@/handler'
import { t, DurationsSchema, PreferencesSchema } from '@schemas'
import { DefaultMaxDurations } from '~core/constants/commute-constants'
import type { Durations, DurationsByMode } from '~core/database'
import { randomInt } from '~core/helpers'
import { Address, DBUserPreferences, UserPreferences } from '~core/types'

const resDTO = t.Object({
  durations: DurationsSchema,
  preferences: PreferencesSchema,
})

const queryDTO = t.Object({
  userSessionId: t.String(),
})

const reqDTO = t.Object({
  userSessionId: t.String(),
  preferences: PreferencesSchema,
})

export const commuteDurationsEndpointHandler = app
  .get(
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
        .get({ $userSessionId: userSessionId }) as DBUserPreferences | null

      if (!result) {
        result = {
          addresses: '[]',
          ...DefaultMaxDurations,
        }
      }
      const preferences: UserPreferences = {
        addresses: JSON.parse(result.addresses || '[]'),
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
        preferences,
      })
    },
    {
      query: queryDTO,
      response: res(resDTO),
    },
  )
  .post(
    '/durations',
    ({ body, db, res }) => {
      const { userSessionId, preferences } = body
      const { addresses, maxDurations } = preferences

      const existing = db
        .query(
          `SELECT id FROM user_preferences WHERE userSessionId = $userSessionId`,
        )
        .get({ $userSessionId: userSessionId })

      if (existing) {
        db.query(
          `UPDATE user_preferences 
           SET addresses = $addresses,
               walking = $walking,
               biking = $biking,
               driving = $driving,
               transit = $transit,
               updatedAt = CURRENT_TIMESTAMP
           WHERE userSessionId = $userSessionId`,
        ).run({
          $userSessionId: userSessionId,
          $addresses: JSON.stringify(addresses),
          $walking: maxDurations.walking,
          $biking: maxDurations.biking,
          $driving: maxDurations.driving,
          $transit: maxDurations.transit,
        })
      } else {
        db.query(
          `INSERT INTO user_preferences (userSessionId, addresses, walking, biking, driving, transit)
           VALUES ($userSessionId, $addresses, $walking, $biking, $driving, $transit)`,
        ).run({
          $userSessionId: userSessionId,
          $addresses: JSON.stringify(addresses),
          $walking: maxDurations.walking,
          $biking: maxDurations.biking,
          $driving: maxDurations.driving,
          $transit: maxDurations.transit,
        })
      }

      const durations: Durations = {}

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
        preferences,
      })
    },
    {
      body: reqDTO,
      response: res(resDTO),
    },
  )
