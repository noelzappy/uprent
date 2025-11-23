<script lang="ts">
  import type { Durations } from '~core/database'
  import type { Address, MaxDurations } from '~core/types'
  import { CommuteTime } from '~ui/components/widgets'
  import { DefaultMaxDurations } from '~core/constants/commute-constants'
  import { extensionCommuteStorage } from '@shared/stores'
  import { onMount } from 'svelte'

  let loading = false
  let durations: Durations | null = null
  let addresses: Address[] = []
  let maxDurations: MaxDurations = DefaultMaxDurations
  let showSettingsModal = false

  onMount(async () => {
    const prefs = await extensionCommuteStorage.getPrefs()
    addresses = prefs.addresses
    maxDurations = prefs.maxDurations
  })

  const load = async () => {
    if (addresses.length === 0) {
      showSettingsModal = true
      return
    }
    loading = true
    const response = await extensionCommuteStorage.fetchCommutes()
    durations = response.data?.durations || null
    loading = false
    maxDurations =
      response.data?.preferences.maxDurations || DefaultMaxDurations
    addresses = response.data?.preferences.addresses || []
  }

  const handleSaveSettings = async (
    newAddresses: Address[],
    newMaxDurations: MaxDurations,
  ) => {
    loading = true
    showSettingsModal = false
    addresses = newAddresses
    maxDurations = newMaxDurations
    await extensionCommuteStorage.save(newAddresses, newMaxDurations)
    if (addresses.length > 0) {
      await load()
    }
    loading = false
  }
</script>

<CommuteTime
  bind:showSettings={showSettingsModal}
  {durations}
  {loading}
  {load}
  {addresses}
  {maxDurations}
  onSaveSettings={handleSaveSettings}
  isExtension={true}
/>
