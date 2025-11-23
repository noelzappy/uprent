import { app } from '@/handler'
import { commuteDurationsEndpointHandler } from './durations.handler'
import { preferencesEndpointHandler } from './preferences.handler'

export const commuteRoute = app.group('/commute', group =>
  group.use(commuteDurationsEndpointHandler).use(preferencesEndpointHandler),
)
