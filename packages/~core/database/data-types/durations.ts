export type TravelMode = 'walking' | 'driving' | 'transit' | 'biking'

export type DurationsByMode = {
  walking: number | null
  driving: number | null
  transit: number | null
  biking: number | null
  addressLabel: string
  id: string
}

export type Durations = {
  [addressId: string]: DurationsByMode
}
