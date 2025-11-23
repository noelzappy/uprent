import { t } from 'elysia'

export const PropertySchema = t.Object({
  id: t.Number(),
  sourceURL: t.String(),
  title: t.String(),
  cityName: t.String(),
  price: t.Nullable(t.Number()),
  area: t.Nullable(t.Number()),
  previewImageURL: t.String(),
})

export const DurationsByModeSchema = t.Object({
  walking: t.Union([t.Number(), t.Null()]),
  driving: t.Union([t.Number(), t.Null()]),
  transit: t.Union([t.Number(), t.Null()]),
  biking: t.Union([t.Number(), t.Null()]),
  addressLabel: t.String(),
  id: t.String(),
})

export const DurationsSchema = t.Record(t.String(), DurationsByModeSchema)

export const PreferencesSchema = t.Object({
  addresses: t.Array(
    t.Object({
      id: t.String(),
      label: t.String(),
    }),
  ),
  maxDurations: t.Object({
    walking: t.Union([t.Number(), t.Null()]),
    biking: t.Union([t.Number(), t.Null()]),
    driving: t.Union([t.Number(), t.Null()]),
    transit: t.Union([t.Number(), t.Null()]),
  }),
})

export { t }
