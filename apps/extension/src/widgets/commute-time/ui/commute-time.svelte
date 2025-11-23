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
    const cacheData = await extensionCommuteStorage.getPrefs()
    addresses = cacheData.addresses
    maxDurations = cacheData.maxDurations
  })

  const load = async () => {
    if (addresses.length === 0) {
      showSettingsModal = true
      return
    }
    loading = true
    const response = await extensionCommuteStorage.fetchCommutes()
    durations = response.data || null
    loading = false
  }

  const handleSaveSettings = async (
    newAddresses: Address[],
    newMaxDurations: MaxDurations,
  ) => {
    loading = true
    addresses = newAddresses
    maxDurations = newMaxDurations
    await extensionCommuteStorage.save(newAddresses, newMaxDurations)
    showSettingsModal = false
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
