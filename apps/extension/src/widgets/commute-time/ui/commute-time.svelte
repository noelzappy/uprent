<script lang="ts">
  import type { Durations } from '~core/database'
  import type { WorkerResponse, Address, MaxDurations } from '~core/types'
  import { CommuteTime } from '~ui/components/widgets'
  import { DefaultMaxDurations } from '~core/constants/commute-constants'
  import { extensionCommuteStorage } from '@shared/stores'

  let loading = false
  let durations: Durations | null = null
  let addresses: Address[] = []
  let maxDurations: MaxDurations = DefaultMaxDurations
  let showSettingsModal = false

  // onMount(async () => {
  //  addresses = await extensionCommuteStorage.getAddresses()
  //  maxDurations = await extensionCommuteStorage.getMaxDurations()
  // })

  const load = async () => {
    if (addresses.length === 0) {
      showSettingsModal = true
      return
    }
    loading = true
    chrome.runtime.sendMessage(
      {
        action: 'fetchCommutes',
      },
      (response: WorkerResponse<Durations>) => {
        loading = false
        if (response.error || response.success === false) {
          return
        }
        durations = response.data || null
      },
    )
  }

  const handleSaveSettings = async (
    newAddresses: Address[],
    newMaxDurations: MaxDurations,
  ) => {
    addresses = newAddresses
    maxDurations = newMaxDurations
    await extensionCommuteStorage.syncToServer(newAddresses, newMaxDurations)
    showSettingsModal = false
    if (addresses.length > 0) {
      await load()
    }
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
