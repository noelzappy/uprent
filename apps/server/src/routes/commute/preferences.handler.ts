import { app, res } from '@/handler'
import { PreferencesSchema, t } from '@schemas'
import type { UserPreferences } from '~core/types'
import { DefaultMaxDurations } from '~core/constants/commute-constants'

const reqDTO = t.Object({
  userSessionId: t.String(),
  preferences: PreferencesSchema,
})

const getQueryDTO = t.Object({
  userSessionId: t.String(),
})

const resDTO = t.Object({
  preferences: PreferencesSchema,
})

export const preferencesEndpointHandler = app
  .get(
    '/preferences',
    ({ query, db, res }) => {
      const { userSessionId } = query

      console.log(userSessionId)

      const result = db
        .query(
          `SELECT * FROM user_preferences WHERE userSessionId = $userSessionId`,
        )
        .get({ $userSessionId: userSessionId }) as UserPreferences | undefined

      if (!result) {
        return res.ok({
          preferences: {
            addresses: [],
            maxDurations: DefaultMaxDurations,
          },
        })
      }

      return res.ok({
        preferences: {
          addresses: JSON.parse(result.favoriteAddresses || '[]'),
          maxDurations: {
            walking: result.walking,
            biking: result.biking,
            driving: result.driving,
            transit: result.transit,
          },
        },
      })
    },
    {
      query: getQueryDTO,
      response: res(resDTO),
    },
  )
  .post(
    '/preferences',
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
           SET favoriteAddresses = $favoriteAddresses,
               walking = $walking,
               biking = $biking,
               driving = $driving,
               transit = $transit,
               updatedAt = CURRENT_TIMESTAMP
           WHERE userSessionId = $userSessionId`,
        ).run({
          $userSessionId: userSessionId,
          $favoriteAddresses: JSON.stringify(addresses),
          $walking: maxDurations.walking,
          $biking: maxDurations.biking,
          $driving: maxDurations.driving,
          $transit: maxDurations.transit,
        })
      } else {
        db.query(
          `INSERT INTO user_preferences (userSessionId, favoriteAddresses, walking, biking, driving, transit)
           VALUES ($userSessionId, $favoriteAddresses, $walking, $biking, $driving, $transit)`,
        ).run({
          $userSessionId: userSessionId,
          $favoriteAddresses: JSON.stringify(addresses),
          $walking: maxDurations.walking,
          $biking: maxDurations.biking,
          $driving: maxDurations.driving,
          $transit: maxDurations.transit,
        })
      }

      return res.ok({
        preferences,
      })
    },
    {
      body: reqDTO,
      response: res(resDTO),
    },
  )
